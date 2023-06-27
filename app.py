from flask import Flask, render_template, request, jsonify, Response
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Establecer el backend de Matplotlib en 'Agg'
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import re
import os

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    ruta_archivo = request.form.get('rutaArchivo')
    if os.path.isfile(ruta_archivo):
        respuesta = {'nombre_archivo': ruta_archivo}
        return jsonify(respuesta) 
    else:
        return Response(status = 404)  # Error: Archivo no encontrado
    

@app.route('/resultados')
def resultados():
    archivo   = request.args.get('archivo')
    dfcolumns = pd.read_csv(archivo, nrows = 1).dtypes
    context   = {'file_name' : archivo, 'columns' : dfcolumns}
    return render_template('resultados.html', **context)


@app.route('/visualize_column', methods = ['POST'])
def visualize_column():
    file_path    = request.form.get('filePath')
    column_name  = request.form.get('columnName')
    column_dtype = request.form.get('columnDtype')

    fileNameRE   = re.sub(r'[\W_]', '_', file_path)[-20:].lower()
    chartPath    = f'static/tmp/{fileNameRE}_{column_name}.png'

    if not os.path.exists(chartPath):
        df           = pd.read_csv(file_path, usecols = [column_name])    
        chartPath    = util_plot(df, column_dtype, chartPath)
    return jsonify({'status' : 200, 'chartPath' : chartPath}) 



def util_plot(df, dtype, chartPath):
    column_name = df.columns[0]
    fig, ax = plt.subplots()
    # Chart
    if dtype == 'object':
        df[column_name].value_counts(dropna = False).sort_values().plot(kind = 'barh', ax = ax)
        ax.set_ylabel('')
    else:
        sns.kdeplot(df, ax = ax)
        # Customization
        ax.set_xlabel(df.columns[0])
        ax.set_ylabel('Density')
    fig.savefig(chartPath, bbox_inches = 'tight')
    plt.close()
    return chartPath


@app.route('/simulate_banding', methods = ['POST'])
def simulate_banding():
    file_path    = request.form.get('filePath')
    column_name  = request.form.get('columnName')
    column_dtype = request.form.get('columnDtype')
    config       = request.form.get('config')

    fileNameRE   = re.sub(r'[\W_]', '_', file_path)[-20:].lower()
    chartPath    = f'static/tmp/{fileNameRE}_{column_name}_banded.png'

    df = pd.read_csv(file_path, usecols = [column_name])
    # Hardcode because I will use the Bander I created at Liberty
    bins   = list(range(0, 10, 1))
    labels = [f'Group {b}' for b in bins]
    bins.append(np.inf)
    ############################ End Hardcode #########################
    fig, ax = plt.subplots()
    try:
        dfb = pd.cut(x = df[column_name], bins = bins, labels = labels)
    except ValueError as e:
        return jsonify({'status' : 500, 'message' : str(e)}) 
    dfb.value_counts(dropna = False).sort_index().plot(kind = 'barh', ax = ax)
    ax.set_ylabel('')
    fig.savefig(chartPath, bbox_inches = 'tight')
    plt.close()
    return jsonify({'status' : 200, 'chartPath' : chartPath}) 


if __name__ == '__main__':
    app.run(debug=True)