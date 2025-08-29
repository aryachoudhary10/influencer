# app.py
# Import necessary libraries
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 
import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt 
import datetime
import smtplib # For sending emails
from email.message import EmailMessage # For creating email messages
import requests
from dotenv import load_dotenv
import os
import logging
# from tracking import record_click, record_sale


db = None
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase connection successful.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

load_dotenv()  # looks for .env in project root

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
CUELINKS_API_KEY = os.getenv("CUELINKS_API_KEY")


# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app) 


def send_payout_notification_email(user_email, amount, upi_id):
    if not SENDER_EMAIL or not SENDER_PASSWORD or SENDER_EMAIL == "your-email@gmail.com":
        print("Email credentials not configured. Skipping email notification.")
        return

    msg = EmailMessage()
    msg.set_content(f"""
    A new payout request has been submitted. Please process it manually.

    Details:
    - Influencer Email: {user_email}
    - Amount: ₹{amount}
    - UPI ID: {upi_id}

    After sending the payment, go to the Firestore 'transactions' collection and update this transaction's status to 'completed'.
    Then, go to the 'users' collection and set the user's 'pendingPoints' back to 0.
    """)

    msg['Subject'] = f'Payout Request: ₹{amount} for {user_email}'
    msg['From'] = SENDER_EMAIL
    msg['To'] = ADMIN_EMAIL

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("Payout notification email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")

# --- API Routes ---

@app.route('/signup', methods=['POST'])
def signup():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        username = data['username'].lower()

        users_ref = db.collection('users')
        
        existing_email = users_ref.where('email', '==', email).limit(1).get()
        if len(list(existing_email)) > 0:
            return jsonify({"error": "An account with this email already exists."}), 409
        
        existing_username = users_ref.where('username', '==', username).limit(1).get()
        if len(list(existing_username)) > 0:
            return jsonify({"error": "This username is already taken."}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_data = {
            'email': email,
            'username': username,
            'password': hashed_password.decode('utf-8'),
            'availablePoints': 0,
            'pendingPoints': 0,
            'gpayId': ''
        }
        users_ref.add(user_data)
        print(f"New user signed up: {email} ({username})")
        return jsonify({"message": "Account created successfully!"}), 201
    except Exception as e:
        print(f"Signup Error: {e}")
        return jsonify({"error": "An error occurred during signup."}), 500


@app.route('/login', methods=['POST'])
def login():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        users_ref = db.collection('users')
        query_result = users_ref.where('email', '==', email).limit(1).get()
        user_list = list(query_result)
        if not user_list:
            return jsonify({"error": "Invalid email or password."}), 401
        user_doc = user_list[0]
        user_data = user_doc.to_dict()
        stored_hashed_password = user_data['password'].encode('utf-8')
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
            print(f"User logged in: {email}")
            return jsonify({
                "message": "Login successful!",
                "user": {
                    "id": user_doc.id,
                    "email": user_data['email'],
                    "username": user_data.get('username'),
                    "availablePoints": user_data.get('availablePoints', 0),
                    "pendingPoints": user_data.get('pendingPoints', 0)
                }
            }), 200
        else:
            return jsonify({"error": "Invalid email or password."}), 401
    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({"error": "An error occurred during login."}), 500

@app.route('/get_user/<user_id>', methods=['GET'])
def get_user(user_id):
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        return jsonify({
            "id": user_doc.id,
            "email": user_data.get('email'),
            "username": user_data.get('username'),
            "availablePoints": user_data.get('availablePoints', 0),
            "pendingPoints": user_data.get('pendingPoints', 0)
        }), 200
    except Exception as e:
        print(f"Get User Error: {e}")
        return jsonify({"error": "Could not fetch user data."}), 500


# --- UPDATED: Add Product with Cuelinks Integration ---
@app.route('/add_product', methods=['POST'])
def add_product():
    if not db:
        return jsonify({"error": "Backend not initialized correctly"}), 500
    try:
        data = request.get_json()
        user_id = data['userId']
        product_name = data['productName']
        product_url = data['productUrl']
        image_url = data['imageUrl'] # Get image URL from frontend

        affiliate_url = product_url
        is_affiliated = False

        if CUELINKS_API_KEY != "YOUR_CUELINKS_API_KEY":
            try:
                cuelinks_api_url = os.getenv("CUELINKS_API_URL")
                headers = {"Authorization": f"Token token={CUELINKS_API_KEY}"}
                params = {"url": product_url}
                
                response = requests.get(cuelinks_api_url, headers=headers, params=params)
                response.raise_for_status()
                
                cuelinks_data = response.json()
                generated_url = cuelinks_data.get("affiliate_url")

                if generated_url and generated_url != product_url:
                    affiliate_url = generated_url
                    is_affiliated = True
                    print(f"Cuelinks URL generated: {affiliate_url}")
                else:
                    print("Cuelinks returned original URL. Commission likely not available.")
            except requests.exceptions.RequestException as e:
                print(f"Cuelinks API Error: {e}. Falling back to original URL.")
        else:
            print("Cuelinks API key not configured. Using original URL.")

        product_data = {
            'userId': user_id,
            'name': product_name,
            'originalUrl': product_url,
            'affiliateUrl': affiliate_url,
            'imageUrl': image_url, 
            'isAffiliated': is_affiliated,
            'createdAt': datetime.datetime.now(tz=datetime.timezone.utc)
        }
        
        product_ref = db.collection('products').add(product_data)
        
        new_product = { "id": product_ref[1].id, **product_data }
        new_product['createdAt'] = new_product['createdAt'].isoformat()

        return jsonify({ "message": "Product added successfully!", "product": new_product, "isAffiliated": is_affiliated }), 201
    except Exception as e:
        print(f"Add Product Error: {e}")
        return jsonify({"error": "An error occurred while adding the product."}), 500

# --- NEW: Route to delete a product ---
@app.route('/delete_product/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    
    try:
        data = request.get_json()
        user_id = data['userId']

        product_ref = db.collection('products').document(product_id)
        product_doc = product_ref.get()

        if not product_doc.exists:
            return jsonify({"error": "Product not found."}), 404
        
        # Security check: Ensure the user owns this product
        if product_doc.to_dict().get('userId') != user_id:
            return jsonify({"error": "Unauthorized action."}), 403

        product_ref.delete()
        print(f"Product {product_id} deleted by user {user_id}.")
        return jsonify({"message": "Product deleted successfully."}), 200

    except Exception as e:
        print(f"Delete Product Error: {e}")
        return jsonify({"error": "An error occurred while deleting the product."}), 500


@app.route('/get_products/<user_id>', methods=['GET'])
def get_products(user_id):
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    
    try:
        products_ref = db.collection('products')
        query = products_ref.where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
        results = query.get()
        products = []
        for doc in results:
            product_data = doc.to_dict()
            product_data['id'] = doc.id
            if 'createdAt' in product_data and hasattr(product_data['createdAt'], 'isoformat'):
                 product_data['createdAt'] = product_data['createdAt'].isoformat()
            products.append(product_data)
        return jsonify(products), 200
    except Exception as e:
        print(f"Get Products Error: {e}")
        return jsonify({"error": "Could not fetch products."}), 500

@app.route('/redeem', methods=['POST'])
def redeem():
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    
    try:
        data = request.get_json()
        user_id = data['userId']
        gpay_id = data['gpayId']
        
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found."}), 404
            
        user_data = user_doc.to_dict()
        points_to_redeem = user_data.get('availablePoints', 0)
        
        if points_to_redeem < 500:
            return jsonify({"error": "You need at least 500 points to redeem."}), 400
            
        transaction_data = {
            'userId': user_id,
            'type': 'Redeemed',
            'status': 'pending_approval',
            'points': points_to_redeem,
            'gpayId': gpay_id,
            'createdAt': datetime.datetime.now(tz=datetime.timezone.utc)
        }
        db.collection('transactions').add(transaction_data)

        user_ref.update({
            'availablePoints': 0,
            'pendingPoints': firestore.Increment(points_to_redeem),
            'gpayId': gpay_id
        })
        
        send_payout_notification_email(
            user_email=user_data.get('email'),
            amount=points_to_redeem,
            upi_id=gpay_id
        )
        
        return jsonify({"message": f"Redemption request for {points_to_redeem} points has been sent for approval."}), 200
        
    except Exception as e:
        print(f"Redeem Error: {e}")
        return jsonify({"error": "An error occurred during redemption."}), 500


@app.route('/get_transactions/<user_id>', methods=['GET'])
def get_transactions(user_id):
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    
    try:
        transactions_ref = db.collection('transactions')
        query = transactions_ref.where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
        results = query.get()
        transactions = []
        for doc in results:
            tx_data = doc.to_dict()
            tx_data['id'] = doc.id
            if 'createdAt' in tx_data and hasattr(tx_data['createdAt'], 'isoformat'):
                 tx_data['createdAt'] = tx_data['createdAt'].isoformat()
            transactions.append(tx_data)
        return jsonify(transactions), 200
    except Exception as e:
        print(f"Get Transactions Error (likely needs index): {e}")
        return jsonify([]), 200

# @app.route('/add_points', methods=['POST'])
# def add_points():
#     if not db:
#         return jsonify({"error": "Database not initialized"}), 500
    
#     try:
#         data = request.get_json()
#         user_id = data['userId']
#         points_to_add = int(data['points'])
#         reason = data.get('reason', 'Manual Test Credit')
        
#         transaction_data = {
#             'userId': user_id,
#             'type': 'Earned',
#             'status': 'completed',
#             'points': points_to_add,
#             'product': reason,
#             'createdAt': datetime.datetime.now(tz=datetime.timezone.utc)
#         }
#         db.collection('transactions').add(transaction_data)
        
#         user_ref = db.collection('users').document(user_id)
#         user_ref.update({
#             'availablePoints': firestore.Increment(points_to_add)
#         })
        
#         print(f"Added {points_to_add} points to user {user_id} for: {reason}")
        
#         return jsonify({"message": f"{points_to_add} points added successfully!"}), 200
        
#     except Exception as e:
#         print(f"Add Points Error: {e}")
#         return jsonify({"error": "An error occurred while adding points."}), 500

@app.route('/showcase/<username>')
def showcase(username):
    if not db:
        return "Error: Database not initialized", 500
    
    try:
        users_ref = db.collection('users')
        user_query = users_ref.where('username', '==', username.lower()).limit(1).get()
        user_list = list(user_query)
        
        if not user_list:
            return "Showcase not found", 404
            
        user_doc = user_list[0]
        user_id = user_doc.id
        user_data = user_doc.to_dict()
        
        products_ref = db.collection('products')
        product_query = products_ref.where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
        results = product_query.get()
        
        products = []
        for doc in results:
            product_data = doc.to_dict()
            products.append(product_data)
            
        return render_template('showcase.html', influencer=user_data, products=products)

    except Exception as e:
        print(f"Showcase Error: {e}")
        return "An error occurred while loading the showcase.", 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)  # debug=False in production
