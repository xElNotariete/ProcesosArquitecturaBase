const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

function CAD() {
  // colección usuarios en Mongo
  this.usuarios = null;

  // conectar a Mongo Atlas
  this.conectar = async function(callback) {
    const cad = this;
    const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb+srv://sns:<db_password>@procesocluster.efauuxe.mongodb.net/?appName=ProcesoCluster';
    const client = new mongo(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      const database = client.db('sistema');
      cad.usuarios = database.collection('usuarios');
      if (callback) callback(database);
    } catch (err) {
      console.error('[cad] Error conectando a MongoDB:', err.message || err);
      throw err;
    }
  };

  // buscar o crear usuario en MongoDB
  this.buscarOCrearUsuario = async function(usr, callback) {
    try {
      const resultado = await buscarOCrear(this.usuarios, usr);
      callback(resultado);
    } catch (err) {
      console.error('[cad] Error en buscarOCrearUsuario:', err);
      callback({ error: err.message });
    }
  };
}

// función auxiliar para buscar o crear un documento en una colección
async function buscarOCrear(coleccion, criterio) {
  try {
    const doc = await coleccion.findOneAndUpdate(
      criterio,
      { $set: criterio },
      { upsert: true, returnDocument: "after", projection: { email: 1 } }
    );
    console.log("Elemento actualizado");
    console.log(doc.email || doc.value?.email);
    return { email: doc.email || doc.value?.email };
  } catch (err) {
    console.error('[buscarOCrear] Error:', err);
    throw err;
  }
}

module.exports.CAD = CAD;
