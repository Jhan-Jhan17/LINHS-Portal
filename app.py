from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
import json
import os
from pathlib import Path

app = Flask(__name__, 
            static_folder='dist/assets', 
            template_folder='dist')
app.secret_key = 'linhs-secret-key-change-in-production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'teacher_login'

# Data directory
DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, email, name, role):
        self.id = email
        self.email = email
        self.name = name
        self.role = role
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_teacher(self):
        return self.role == 'teacher'

# Predefined users
USERS = {
    'teacher@linhs.edu.ph': {
        'password': generate_password_hash('teacher123'),
        'name': 'Teacher User',
        'role': 'teacher'
    },
    'admin@linhs.edu.ph': {
        'password': generate_password_hash('admin123'),
        'name': 'Admin User',
        'role': 'admin'
    }
}

@login_manager.user_loader
def load_user(email):
    if email in USERS:
        user_data = USERS[email]
        return User(email, user_data['name'], user_data['role'])
    return None

# Decorator for admin-only routes
def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin():
            flash('Admin access required', 'error')
            return redirect(url_for('teacher_dashboard'))
        return f(*args, **kwargs)
    return decorated_function

# Helper functions for data management
def load_data(filename):
    filepath = DATA_DIR / filename
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

def save_data(filename, data):
    filepath = DATA_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def init_data():
    """Initialize default data if not exists"""
    # School Info
    if not load_data('school_info.json'):
        save_data('school_info.json', {
            'name': 'Lumbang Integrated National High School',
            'motto': 'Excellence in Education',
            'vision': 'A center of excellence providing quality education for all students.',
            'mission': 'To develop well-rounded individuals equipped with knowledge, skills, and values.',
            'address': 'Lumbang, Philippines',
            'email': 'linhs@example.com',
            'phone': '+63 123 456 7890'
        })
    
    # Strands
    if not load_data('strands.json'):
        save_data('strands.json', [
            {
                'id': 'ict',
                'name': 'ICT',
                'fullName': 'Information and Communications Technology',
                'description': 'Prepares students for careers in technology and computer science.',
                'color': 'blue',
                'icon': 'TrendingUp',
                'subjects': {
                    'grade11': ['Computer Programming', 'Web Development', 'Database Management', 'Computer Systems Servicing'],
                    'grade12': ['Advanced Programming', 'Network Administration', 'Multimedia Arts', 'ICT Project Management']
                },
                'careerPaths': ['Software Developer', 'Web Developer', 'Network Administrator', 'Database Administrator', 'IT Support Specialist']
            },
            {
                'id': 'stem',
                'name': 'STEM',
                'fullName': 'Science, Technology, Engineering, and Mathematics',
                'description': 'Focuses on developing scientific and mathematical skills.',
                'color': 'green',
                'icon': 'GraduationCap',
                'subjects': {
                    'grade11': ['General Biology', 'General Physics', 'General Chemistry', 'Pre-Calculus'],
                    'grade12': ['Advanced Biology', 'Advanced Physics', 'Advanced Chemistry', 'Calculus', 'Research']
                },
                'careerPaths': ['Engineer', 'Scientist', 'Medical Doctor', 'Researcher', 'Mathematician', 'Architect']
            },
            {
                'id': 'humss',
                'name': 'HUMSS',
                'fullName': 'Humanities and Social Sciences',
                'description': 'Develops understanding of human behavior and society.',
                'color': 'purple',
                'icon': 'BookOpen',
                'subjects': {
                    'grade11': ['Philippine History', 'World Religions', 'Creative Writing', 'Introduction to Philosophy'],
                    'grade12': ['Community Engagement', 'Creative Nonfiction', 'Trends & Issues', 'Social Science Research']
                },
                'careerPaths': ['Lawyer', 'Social Worker', 'Journalist', 'Psychologist', 'Teacher', 'Diplomat']
            }
        ])
    
    # Students
    if not load_data('students.json'):
        save_data('students.json', [])
    
    # Classes
    if not load_data('classes.json'):
        save_data('classes.json', [])
    
    # Announcements
    if not load_data('announcements.json'):
        save_data('announcements.json', [
            {
                'id': '1',
                'title': 'Welcome to School Year 2025-2026',
                'content': 'We are excited to welcome all students to the new school year. Classes begin on June 5, 2025.',
                'date': '2025-05-15',
                'priority': 'high'
            }
        ])
    
    # Resources
    if not load_data('resources.json'):
        save_data('resources.json', [])
    
    # Gallery
    if not load_data('gallery.json'):
        save_data('gallery.json', [])

# Initialize data on startup
init_data()

# Routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return render_template("index.html")
    
    # Calculate stats
    strands = load_data('strands.json')
    stats = {
        'totalStudents': len(students),
        'totalClasses': len(classes),
        'strandCounts': {
            'ict': len([s for s in students if s.get('strand') == 'ict']),
            'stem': len([s for s in students if s.get('strand') == 'stem']),
            'humss': len([s for s in students if s.get('strand') == 'humss'])
        }
    }
    
    return render_template('home.html', 
                         school_info=school_info, 
                         stats=stats, 
                         announcements=announcements[:3])

@app.route('/teacher/login', methods=['GET', 'POST'])
def teacher_login():
    if current_user.is_authenticated:
        return redirect(url_for('teacher_dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if email in USERS and check_password_hash(USERS[email]['password'], password):
            user = User(email, USERS[email]['name'], USERS[email]['role'])
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
    return redirect(url_for('home'))

@app.route('/teacher/dashboard')
@login_required
def teacher_dashboard():
    students = load_data('students.json')
    classes = load_data('classes.json')
    announcements = load_data('announcements.json')
    
    return render_template('teacher_dashboard.html',
                         students=students,
                         classes=classes,
                         announcements=announcements,
                         is_admin=current_user.is_admin())

# API Routes for AJAX requests

@app.route('/api/students', methods=['GET', 'POST'])
@login_required
def api_students():
    students = load_data('students.json')
    
    if request.method == 'POST':
        data = request.json
        data['id'] = str(len(students) + 1)
        students.append(data)
        save_data('students.json', students)
        return jsonify({'success': True, 'student': data})
    
    return jsonify(students)

@app.route('/api/students/<student_id>', methods=['PUT', 'DELETE'])
@login_required
def api_student(student_id):
    students = load_data('students.json')
    
    if request.method == 'PUT':
        data = request.json
        for i, student in enumerate(students):
            if student['id'] == student_id:
                students[i] = {**student, **data}
                save_data('students.json', students)
                return jsonify({'success': True, 'student': students[i]})
        return jsonify({'success': False, 'error': 'Student not found'}), 404
    
    elif request.method == 'DELETE':
        students = [s for s in students if s['id'] != student_id]
        save_data('students.json', students)
        return jsonify({'success': True})

@app.route('/api/classes', methods=['GET', 'POST'])
@login_required
def api_classes():
    classes = load_data('classes.json')
    
    if request.method == 'POST':
        data = request.json
        data['id'] = str(len(classes) + 1)
        classes.append(data)
        save_data('classes.json', classes)
        return jsonify({'success': True, 'class': data})
    
    return jsonify(classes)

@app.route('/api/classes/<class_id>', methods=['PUT', 'DELETE'])
@login_required
def api_class(class_id):
    classes = load_data('classes.json')
    
    if request.method == 'PUT':
        data = request.json
        for i, cls in enumerate(classes):
            if cls['id'] == class_id:
                classes[i] = {**cls, **data}
                save_data('classes.json', classes)
                return jsonify({'success': True, 'class': classes[i]})
        return jsonify({'success': False, 'error': 'Class not found'}), 404
    
    elif request.method == 'DELETE':
        classes = [c for c in classes if c['id'] != class_id]
        save_data('classes.json', classes)
        return jsonify({'success': True})

@app.route('/api/announcements', methods=['GET', 'POST'])
def api_announcements():
    announcements = load_data('announcements.json')
    
    if request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.json
        data['id'] = str(len(announcements) + 1)
        data['date'] = datetime.now().strftime('%Y-%m-%d')
        announcements.append(data)
        save_data('announcements.json', announcements)
        return jsonify({'success': True, 'announcement': data})
    
    return jsonify(announcements)

@app.route('/api/announcements/<announcement_id>', methods=['PUT', 'DELETE'])
@login_required
def api_announcement(announcement_id):
    announcements = load_data('announcements.json')
    
    if request.method == 'PUT':
        data = request.json
        for i, announcement in enumerate(announcements):
            if announcement['id'] == announcement_id:
                announcements[i] = {**announcement, **data}
                save_data('announcements.json', announcements)
                return jsonify({'success': True, 'announcement': announcements[i]})
        return jsonify({'success': False, 'error': 'Announcement not found'}), 404
    
    elif request.method == 'DELETE':
        announcements = [a for a in announcements if a['id'] != announcement_id]
        save_data('announcements.json', announcements)
        return jsonify({'success': True})

@app.route('/api/resources', methods=['GET', 'POST'])
def api_resources():
    resources = load_data('resources.json')
    
    if request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.json
        data['id'] = str(len(resources) + 1)
        resources.append(data)
        save_data('resources.json', resources)
        return jsonify({'success': True, 'resource': data})
    
    return jsonify(resources)

@app.route('/api/resources/<resource_id>', methods=['PUT', 'DELETE'])
@login_required
def api_resource(resource_id):
    resources = load_data('resources.json')
    
    if request.method == 'PUT':
        data = request.json
        for i, resource in enumerate(resources):
            if resource['id'] == resource_id:
                resources[i] = {**resource, **data}
                save_data('resources.json', resources)
                return jsonify({'success': True, 'resource': resources[i]})
        return jsonify({'success': False, 'error': 'Resource not found'}), 404
    
    elif request.method == 'DELETE':
        resources = [r for r in resources if r['id'] != resource_id]
        save_data('resources.json', resources)
        return jsonify({'success': True})

@app.route('/api/gallery', methods=['GET', 'POST'])
def api_gallery():
    gallery = load_data('gallery.json')
    
    if request.method == 'POST':
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.json
        data['id'] = str(len(gallery) + 1)
        gallery.append(data)
        save_data('gallery.json', gallery)
        return jsonify({'success': True, 'item': data})
    
    return jsonify(gallery)

@app.route('/api/gallery/<item_id>', methods=['PUT', 'DELETE'])
@admin_required
def api_gallery_item(item_id):
    gallery = load_data('gallery.json')
    
    if request.method == 'PUT':
        data = request.json
        for i, item in enumerate(gallery):
            if item['id'] == item_id:
                gallery[i] = {**item, **data}
                save_data('gallery.json', gallery)
                return jsonify({'success': True, 'item': gallery[i]})
        return jsonify({'success': False, 'error': 'Gallery item not found'}), 404
    
    elif request.method == 'DELETE':
        gallery = [g for g in gallery if g['id'] != item_id]
        save_data('gallery.json', gallery)
        return jsonify({'success': True})

@app.route('/api/school-info', methods=['GET', 'POST'])
def api_school_info():
    school_info = load_data('school_info.json')
    
    if request.method == 'POST':
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        
        data = request.json
        save_data('school_info.json', data)
        return jsonify({'success': True, 'school_info': data})
    
    return jsonify(school_info)

@app.route('/api/strands/<strand_id>', methods=['PUT'])
@admin_required
def api_update_strand(strand_id):
    strands = load_data('strands.json')
    data = request.json
    
    for i, strand in enumerate(strands):
        if strand['id'] == strand_id:
            strands[i] = {**strand, **data}
            save_data('strands.json', strands)
            return jsonify({'success': True, 'strand': strands[i]})
    
    return jsonify({'success': False, 'error': 'Strand not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
