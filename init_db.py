import mysql.connector
from mysql.connector import Error
import os

schema_path = os.path.join(os.path.dirname(__file__), 'linhs_portal.sql')

try:
    with open(schema_path, 'r', encoding='utf-8') as f:
        sql_script = f.read()
except FileNotFoundError:
    print(f"Error: Could not find {schema_path}")
    exit(1)

# Connect to MySQL
try:
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        allow_local_infile=True,
        autocommit=True
    )
    print("✓ Connected to MySQL successfully")
    
    cursor = connection.cursor()
    
    # Create database
    try:
        cursor.execute("CREATE DATABASE IF NOT EXISTS linhs_portal")
        print("✓ Created/verified database linhs_portal")
    except Error as e:
        print(f"✗ Error creating database: {e}")
    
    # Close the cursor and reconnect to the specific database
    cursor.close()
    connection.close()
    
    # Reconnect to the linhs_portal database
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='linhs_portal',
        allow_local_infile=True,
        autocommit=True
    )
    print("✓ Connected to linhs_portal database")
    
    cursor = connection.cursor()
    
    # Split script by semicolons and execute each statement
    statements = sql_script.split(';')
    for i, statement in enumerate(statements):
        statement = statement.strip()
        if statement and not statement.startswith('--'):
            try:
                cursor.execute(statement)
                print(f"✓ Executed statement {i+1}")
            except Error as e:
                print(f"✗ Error executing statement {i+1}: {e}")
    
    cursor.close()
    connection.close()
    print("\n✓ Database initialized successfully!")
    
except Error as e:
    print(f"✗ Error connecting to MySQL: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure MySQL service is running")
    print("2. Verify your MySQL credentials (host, user, password)")
    print("3. Or run this command directly: mysql -u root < linhs_portal.sql")