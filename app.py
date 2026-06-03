from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import uuid
from models import db

# Load environment variables
load_dotenv()

app = Flask(__name__, 
            static_folder='dist/assets', 
            template_folder='dist')
app.secret_key = os.getenv('SECRET_KEY', 'linhs-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Enable CORS
CORS(app, 
     resources={r"/api/*": {
         "origins": ["http://localhost:5173"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }})

# Flask-SQLAlchemy setup
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'linhs_portal')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'teacher_login'

# ==========================================
# DATABASE CONNECTION HELPER
# ==========================================
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'linhs_portal')
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# ==========================================
# USER MANAGEMENT (Flask-Login)
# ==========================================
class User(UserMixin):
    def __init__(self, id, email, name, role):
        self.id = str(id)
        self.email = email
        self.name = name
        self.role = role
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_teacher(self):
        return self.role == 'teacher'

@login_manager.unauthorized_handler
def unauthorized():
    # If a React API fetch fails auth, send JSON instead of an HTML page
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    # Otherwise, redirect normal browser traffic to the login page
    return redirect(url_for('teacher_login'))

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        # Assuming your users table uses 'id' as the primary key
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user_data:
            return User(user_data['id'], user_data['email'], user_data['name'], user_data['role'])
    return None

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin():
            if request.path.startswith('/api/'):
                return jsonify({'success': False, 'error': 'Admin access required'}), 403
            flash('Admin access required', 'error')
            return redirect(url_for('teacher_dashboard'))
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# FRONTEND & DASHBOARD ROUTES
# ==========================================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        from flask import send_from_directory
        return send_from_directory(app.static_folder, path)
    else:
        # If it's the index, we need to gather stats from the DB
        conn = get_db_connection()
        if not conn:
            return render_template("index.html") # Fallback if DB is down
            
        cursor = conn.cursor(dictionary=True)
        
        # Get School Info
        cursor.execute("SELECT * FROM school_info LIMIT 1")
        school_info = cursor.fetchone() or {}
        
        # Get Announcements (Latest 3)
        cursor.execute("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 3")
        announcements = cursor.fetchall()
        
        # Calculate Stats
        cursor.execute("SELECT COUNT(*) as total FROM students")
        total_students = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM classes")
        total_classes = cursor.fetchone()['total']
        
        cursor.execute("SELECT grade_level, COUNT(*) as count FROM students GROUP BY grade_level")
        grade_data = cursor.fetchall()
        grade_counts = {row['grade_level']: row['count'] for row in grade_data if row['grade_level']}
        
        stats = {
            'totalStudents': total_students,
            'totalClasses': total_classes,
            'gradeCounts': grade_counts
        }
        
        cursor.close()
        conn.close()
        
        # Only render template if it exists, otherwise standard index
        try:
            return render_template('home.html', 
                                 school_info=school_info, 
                                 stats=stats, 
                                 announcements=announcements)
        except:
            return render_template("index.html")

@app.route('/teacher/login', methods=['GET', 'POST'])
def teacher_login():
    if current_user.is_authenticated:
        return redirect(url_for('teacher_dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        # Note: If you hashed passwords in DB, use check_password_hash(user_data['password'], password)
        if user_data and user_data['password'] == password: 
            user = User(user_data['id'], user_data['email'], user_data['name'], user_data['role'])
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('teacher_dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('teacher_login.html')

@app.route('/teacher/logout')
@login_required
def teacher_logout():
    logout_user()
    flash('You have been logged out', 'success')
    return redirect(url_for('serve'))

@app.route('/teacher/dashboard')
@login_required
def teacher_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    
    cursor.execute("SELECT * FROM classes")
    classes = cursor.fetchall()
    
    cursor.execute("SELECT * FROM announcements ORDER BY date DESC")
    announcements = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('teacher_dashboard.html',
                         students=students,
                         classes=classes,
                         announcements=announcements,
                         is_admin=current_user.is_admin())

# ==========================================
# API ROUTES (AJAX)
# ==========================================

@app.route('/api/students', methods=['GET', 'POST'])
@login_required
def api_students():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            data = request.json
            cursor.execute(
                "INSERT INTO students (lrn, first_name, middle_name, last_name, grade_level, class_id, enrolled_by) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (data.get('lrn'), data.get('first_name'), data.get('middle_name'), data.get('last_name'), data.get('grade_level'), data.get('class_id'), current_user.id if current_user.is_authenticated else None)
            )
            conn.commit()
            data['id'] = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'student': data}), 201
        
        # GET request
        cursor.execute("SELECT * FROM students")
        students = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'students': students})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/students/<student_id>', methods=['PUT', 'DELETE'])
@login_required
def api_student(student_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                "UPDATE students SET lrn=%s, first_name=%s, middle_name=%s, last_name=%s, grade_level=%s, class_id=%s WHERE id=%s",
                (data.get('lrn'), data.get('first_name'), data.get('middle_name'), data.get('last_name'), data.get('grade_level'), data.get('class_id'), student_id)
            )
            conn.commit()
            cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
            updated = cursor.fetchone()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'student': updated}) if updated else (jsonify({'success': False, 'error': 'Not found'}), 404)
        
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/classes', methods=['GET', 'POST'])
@login_required
def api_classes():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            data = request.json
            cursor.execute(
                "INSERT INTO classes (name, grade_level, section, adviser) VALUES (%s, %s, %s, %s)",
                (data.get('name'), data.get('grade_level'), data.get('section'), data.get('adviser'))
            )
            conn.commit()
            data['id'] = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'class': data}), 201
        
        # GET request
        cursor.execute("SELECT * FROM classes")
        classes = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'classes': classes})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/classes/<class_id>', methods=['PUT', 'DELETE'])
@login_required
def api_class(class_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                "UPDATE classes SET name=%s, grade_level=%s, section=%s, adviser=%s WHERE id=%s",
                (data.get('name'), data.get('grade_level'), data.get('section'), data.get('adviser'), class_id)
            )
            conn.commit()
            cursor.execute("SELECT * FROM classes WHERE id = %s", (class_id,))
            updated = cursor.fetchone()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'class': updated}) if updated else (jsonify({'success': False, 'error': 'Not found'}), 404)
        
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM classes WHERE id = %s", (class_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/announcements', methods=['GET', 'POST'])
def api_announcements():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            if not current_user.is_authenticated:
                cursor.close()
                conn.close()
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
            data = request.json
            new_id = str(uuid.uuid4())
            
            cursor.execute(
                """INSERT INTO announcements 
                   (id, title, content, category, author_id, is_published, created_at, updated_at) 
                   VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                (
                    new_id, 
                    data.get('title'), 
                    data.get('content'), 
                    data.get('category', 'general'),
                    current_user.id,
                    1
                )
            )
            conn.commit()
            data['id'] = new_id 
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'announcement': data}), 201
        
        # GET request
        cursor.execute("SELECT * FROM announcements ORDER BY created_at DESC")
        announcements = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'announcements': announcements})
    except Exception as e:
        print(f"Database error: {e}")
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/announcements/<announcement_id>', methods=['PUT', 'DELETE'])
@login_required
def api_announcement(announcement_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                """UPDATE announcements 
                   SET title=%s, content=%s, category=%s, updated_at=NOW() 
                   WHERE id=%s""",
                (data.get('title'), data.get('content'), data.get('category'), announcement_id)
            )
            conn.commit()
            
            cursor.execute("SELECT * FROM announcements WHERE id = %s", (announcement_id,))
            updated = cursor.fetchone()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'announcement': updated}) if updated else (jsonify({'success': False, 'error': 'Not found'}), 404)
        
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM announcements WHERE id = %s", (announcement_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/resources', methods=['GET', 'POST'])
def api_resources():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            if not current_user.is_authenticated:
                cursor.close()
                conn.close()
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
            data = request.json
            cursor.execute(
                "INSERT INTO resources (title, url, uploaded_by) VALUES (%s, %s, %s)",
                (data.get('title'), data.get('url'), current_user.id)
            )
            conn.commit()
            data['id'] = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'resource': data}), 201
        
        # GET request
        cursor.execute("SELECT * FROM resources")
        resources = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'resources': resources})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/resources/<resource_id>', methods=['PUT', 'DELETE'])
@login_required
def api_resource(resource_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                "UPDATE resources SET title=%s, url=%s WHERE id=%s",
                (data.get('title'), data.get('url'), resource_id)
            )
            conn.commit()
            cursor.execute("SELECT * FROM resources WHERE id = %s", (resource_id,))
            updated = cursor.fetchone()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'resource': updated}) if updated else (jsonify({'success': False, 'error': 'Not found'}), 404)
        
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM resources WHERE id = %s", (resource_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/gallery', methods=['GET', 'POST'])
def api_gallery():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            if not current_user.is_authenticated or not current_user.is_admin():
                cursor.close()
                conn.close()
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
            data = request.json
            cursor.execute(
                "INSERT INTO gallery (image_url, caption) VALUES (%s, %s)",
                (data.get('image_url'), data.get('caption'))
            )
            conn.commit()
            data['id'] = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'item': data}), 201
        
        # GET request
        cursor.execute("SELECT * FROM gallery ORDER BY id DESC")
        gallery = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'gallery': gallery})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/gallery/<item_id>', methods=['PUT', 'DELETE'])
@admin_required
def api_gallery_item(item_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'PUT':
            data = request.json
            cursor.execute(
                "UPDATE gallery SET image_url=%s, caption=%s WHERE id=%s",
                (data.get('image_url'), data.get('caption'), item_id)
            )
            conn.commit()
            cursor.execute("SELECT * FROM gallery WHERE id = %s", (item_id,))
            updated = cursor.fetchone()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'item': updated}) if updated else (jsonify({'success': False, 'error': 'Not found'}), 404)
        
        elif request.method == 'DELETE':
            cursor.execute("DELETE FROM gallery WHERE id = %s", (item_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/school-info', methods=['GET', 'POST'])
def api_school_info():
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'POST':
            if not current_user.is_authenticated or not current_user.is_admin():
                cursor.close()
                conn.close()
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
            data = request.json
            cursor.execute("""
                INSERT INTO school_info (id, name, motto, vision, mission, address, email, phone) 
                VALUES (1, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                name=VALUES(name), motto=VALUES(motto), vision=VALUES(vision), 
                mission=VALUES(mission), address=VALUES(address), email=VALUES(email), phone=VALUES(phone)
            """, (data.get('name'), data.get('motto'), data.get('vision'), data.get('mission'), 
                  data.get('address'), data.get('email'), data.get('phone')))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'success': True, 'school_info': data})
        
        # GET request
        cursor.execute("SELECT * FROM school_info WHERE id = 1")
        school_info = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'school_info': school_info or {}})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/strands/<strand_id>', methods=['PUT'])
@admin_required
def api_update_strand(strand_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        data = request.json
        cursor.execute(
            "UPDATE strands SET name=%s, full_name=%s, description=%s WHERE id=%s",
            (data.get('name'), data.get('full_name'), data.get('description'), strand_id)
        )
        conn.commit()
        
        cursor.execute("SELECT * FROM strands WHERE id = %s", (strand_id,))
        updated_strand = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if updated_strand:
            return jsonify({'success': True, 'strand': updated_strand})
        return jsonify({'success': False, 'error': 'Strand not found'}), 404
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
