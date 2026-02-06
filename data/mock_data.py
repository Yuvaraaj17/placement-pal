from faker import Faker
import random
import json

# Initialize Faker with a specific locale
fake = Faker('en_IN')

students = []

for _ in range(200):
    # Generating 12-digit reg no
    reg_no = str(fake.unique.random_number(digits=12, fix_len=True))
    
    student = {
        "reg_no": reg_no,
        "name": fake.name(),
        "dept": random.choice(["CSE", "ECE", "EEE", "MECH"]),
        "cgpa": round(random.uniform(7.5, 9.5), 2),
        "current_offers": random.randint(0, 2),
        "role": "student",
        "email": fake.unique.email(),
        "password": "hashed_password_123"
    }
    students.append(student)

# Save to JSON
with open('students_faker.json', 'w') as f:
    json.dump(students, f, indent=2)

print("200 realistic records generated!")