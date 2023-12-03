# ---------------------
# IMPORTS
# ---------------------
import hashlib
from datetime import datetime
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from flask import Flask, jsonify, request
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import base64

app = Flask(__name__)



# ---------------------
# BLOCK CLASS
# ---------------------
class Block:
    # Initialization of the block with its attributes
    def __init__(self, index, timestamp, data, previous_hash, nonce=0):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.hash_block()

    # Hashing the block's attributes to generate its unique hash
    def hash_block(self):
        sha = hashlib.sha256()
        sha.update(str(self.index).encode('utf-8') +
                   str(self.timestamp).encode('utf-8') +
                   str(self.data).encode('utf-8') +
                   str(self.previous_hash).encode('utf-8') +
                   str(self.nonce).encode('utf-8'))
        return sha.hexdigest()

    # Mining the block by trying different nonce values until the hash meets the difficulty criteria
    def mine_block(self, difficulty):
        while self.hash[:difficulty] != "0" * difficulty:
            self.nonce += 1
            self.hash = self.hash_block()

# ---------------------
# GENESIS BLOCK CREATION
# ---------------------
def make_genesis_block():
    """Make the first block in a block-chain."""
    block = Block(index=0,
                  timestamp=datetime.now(),
                  data="Genesis Block",
                  previous_hash="0")
    return block

# ---------------------
# KEY PAIR GENERATION
# ---------------------
def generate_key_pair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open("public_key.pem", "wb") as f:
        f.write(pem)

    return private_key, public_key

# ---------------------
# DIGITAL SIGNATURE
# ---------------------
def sign_data(private_key, data):
    signature = private_key.sign(data.encode('utf-8'), ec.ECDSA(hashes.SHA256()))
    return signature

# Convert the public key object to PEM format string
def serialize_public_key(public_key):
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

# Verify the digital signature using the public key
def verify_signature(public_key, data, signature):
    try:
        public_key.verify(signature, data.encode('utf-8'), ec.ECDSA(hashes.SHA256()))
        return True
    except:
        return False

# ---------------------
# PUBLIC KEY STORAGE
# ---------------------
public_keys_storage = []


# ---------------------
# PRIVATE KEY STORAGE
# ---------------------
blockchain = [make_genesis_block()]

def store_public_key(public_key):
    serialized_key = serialize_public_key(public_key)
    public_keys_storage.append(serialized_key)    

# ---------------------
# BLOCK CREATION
# ---------------------
def next_block(pre_block, data='', difficulty=5):
    new_block = Block(index=pre_block.index + 1,
                      timestamp=datetime.now(),
                      data=data,
                      previous_hash=pre_block.hash)
    new_block.mine_block(difficulty=difficulty)
    return new_block

# Create a series of blocks for the blockchain
def create_blocks(difficulty=5):
    blockchain = [make_genesis_block()]
    for i in range(1, 21):
        data = f"Block #{i}"
        new_block = next_block(blockchain[-1], data, difficulty)
        blockchain.append(new_block)
    return blockchain




def convert_keys_to_strings(private_key, public_key):
    # Convert private key to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Convert public key to PEM format
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # Convert bytes to strings
    private_key_str = private_pem.decode('utf-8')
    public_key_str = public_pem.decode('utf-8')

    return private_key_str, public_key_str



# ---------------------

@app.route('/generate_keys', methods=['GET'])
def generate_keys():
    private_key, public_key = generate_key_pair()
    store_public_key(public_key)
    private_key_str, public_key_str = convert_keys_to_strings(private_key, public_key)
    return jsonify({
        'private_key': private_key_str,
        'public_key': public_key_str
    })

@app.route('/sign_data', methods=['POST'])
def sign_data_endpoint():
    data = request.json.get('data')
    private_key_str = request.json.get('private_key')

    # Convert the private key string back to the object
    private_key = serialization.load_pem_private_key(private_key_str.encode('utf-8'), password=None)

    signature = sign_data(private_key, data)

     # Convert the bytes signature to a string (or another serializable format)
    signature_str = base64.b64encode(signature).decode('utf-8')

    return jsonify({'signature': signature_str})


# Endpoint to verify signature
@app.route('/verify_signature', methods=['POST'])
def api_verify_signature():
    data = request.json.get('data', '')
    signature = request.json.get('signature', '')
    sender = request.json.get('sender', '') 
    verification_result = verify_signature(sender, data, signature)
    return jsonify({"verification": verification_result})



# Endpoint to create a new block
@app.route('/create_block', methods=['POST'])
def api_create_block():
    data = request.json.get('data', '')
    difficulty = request.json.get('difficulty', 5)
    
    # Find the previous block in the blockchain
    pre_block = blockchain[-1]

    # Create a new block
    new_block = next_block(pre_block, data, difficulty)

    # Append the new block to the blockchain
    blockchain.append(new_block)

    return jsonify({"index": new_block.index, "data": new_block.data, "hash": new_block.hash})



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)

    
# # ---------------------
# # MAIN EXECUTION
# # ---------------------
#  if __name__ == "__main__":
#     # Generate key pair
#     private_key, public_key = generate_key_pair()
#     store_public_key(public_key)
    
#     # Sign and verify a sample data
#     data = "Test Data"
#     signature = sign_data(private_key, data)
#     print("Public Key:\n", serialize_public_key(public_key))
#     print("Signature:", signature)
#     print("Verification:", verify_signature(public_key, data, signature))
    
#     # Create the blockchain with 20 blocks
#     blockchain = create_blocks(difficulty=5)

#     # Print the blocks
#     for block in blockchain:
#         print(f"Block #{block.index} - Data: {block.data} - Hash: {block.hash}")

#     # Print stored public keys
#     print("\nStored Public Keys:")
#     for key in public_keys_storage:
#         print(key)


 
  