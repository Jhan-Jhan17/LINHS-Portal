#!/usr/bin/env python
"""
Simple script to run the Flask application
"""
from app import app

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎓 Lumbang Integrated National High School Portal")
    print("="*60)
    print("\n📚 Server starting...")
    print("🌐 Open your browser and go to: http://localhost:5000")
    print("\n👨‍🏫 Teacher Login:")
    print("   Email: teacher@linhs.edu.ph")
    print("   Password: teacher123")
    print("\n👑 Admin Login:")
    print("   Email: admin@linhs.edu.ph")
    print("   Password: admin123")
    print("\n⚠️  Press CTRL+C to stop the server")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
