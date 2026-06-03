from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from datetime import datetime

db = SQLAlchemy()

# ==========================================
# 1. STANDARD TABLES
# ==========================================

class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    grade_level = db.Column(db.String(10), nullable=False) # Grade level column
    section = db.Column(db.String(10), nullable=False)
    strand = db.Column(db.String(20), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # --- STORED PROCEDURE EXAMPLES ---
    @staticmethod
    def enroll_via_procedure(name, grade_level, section, strand, class_id):
        """Executes a MySQL Stored Procedure to enroll a student safely"""
        sql = text("""
            CALL sp_enroll_student(:name, :grade, :section, :strand, :class_id)
        """)
        db.session.execute(sql, {
            'name': name,
            'grade': grade_level,
            'section': section,
            'strand': strand,
            'class_id': class_id
        })
        db.session.commit()

    @staticmethod
    def get_class_roster_procedure(class_id):
        """Executes a MySQL Stored Procedure to fetch a specific roster"""
        sql = text("CALL sp_get_roster(:class_id)")
        result = db.session.execute(sql, {'class_id': class_id})
        return result.fetchall()

    # --- JOIN EXAMPLE ---
    @staticmethod
    def get_students_with_class_info():
        """Standard SQLAlchemy JOIN query (Alternative to views)"""
        return db.session.query(Student, Class)\
            .join(Class, Student.class_id == Class.id)\
            .all()


class Class(db.Model):
    __tablename__ = 'class'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    grade_level = db.Column(db.String(10), nullable=False)
    strand = db.Column(db.String(20), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    schedule = db.Column(db.String(200))
    
    # Relationship to easily access students in a class
    students = db.relationship('Student', backref='class_info', lazy=True)


# ==========================================
# 2. DATABASE VIEWS (Read-Only Models)
# ==========================================
# If you create a view in MySQL (e.g., CREATE VIEW vw_student_details AS ...), 
# you can query it in Flask just like a regular table by defining it as a model.

class StudentClassView(db.Model):
    """
    Maps to a MySQL View that pre-joins Students and Classes.
    Make sure you don't try to db.session.add() to this!
    """
    __tablename__ = 'vw_student_class_details'
    
    # Flask-SQLAlchemy requires a primary key even for views
    student_id = db.Column(db.Integer, primary_key=True) 
    student_name = db.Column(db.String(100))
    grade_level = db.Column(db.String(10))
    class_name = db.Column(db.String(100))
    teacher_name = db.Column(db.String(100))


# ==========================================
# 3. OTHER STANDARD TABLES (Untouched)
# ==========================================

class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    priority = db.Column(db.String(20), default='normal')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    url = db.Column(db.String(500))

class GalleryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    category = db.Column(db.String(50))
    date = db.Column(db.Date)

class SchoolInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    motto = db.Column(db.String(200))
    vision = db.Column(db.Text)
    mission = db.Column(db.Text)
    address = db.Column(db.String(300))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(50))