from flask import Flask,request,jsonify,render_template,request,Response,redirect,flash, url_for
import pandas as pd 
from flask_cors import CORS
from modules import urlparser,makepredictions,performbuild
app = Flask(__name__)
CORS(app)
@app.route("/api", methods=['POST','GET'])
def api():
    return jsonify({'message' : 'Spam url Checking api Working'}) , 200
@app.route('/api/predict',methods=['POST'])
def predicter():
	if request.method == 'POST':
		message = request.json['message']
		urls = urlparser(message)
		if urls:
			result = makepredictions(urls)
			return jsonify(result),200
		else:
			result= { 'msg' : 'No Urls Found in Message'}
			return jsonify(result),400
@app.route("/api/build", methods=['POST','GET'])
def builder():
    score = performbuild()
    return jsonify({'score' : score }) , 200

if __name__ == '__main__':
	app.run(debug=True)
