import os
from flask import Flask, render_template, request


app = Flask(__name__)


@app.route('/', methods=['GET', "POST"])
def index():
    stat_data = None
    try:
        datasets = os.listdir("static/data")
    except FileNotFoundError:
        return render_template("index.html", message=True)
    
    if request.method == "POST":
        stat_data = request.form.get("dataset")
    return render_template(
        "index.html",
        datasets=datasets,
        stat_data=stat_data
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5600, debug=True)