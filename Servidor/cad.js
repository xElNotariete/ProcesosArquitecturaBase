const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

function CAD() {
  // colección usuarios en Mongo
  this.usuarios = null;

  // conectar a Mongo Atlas
  this.conectar = async function(callback) {
    const cad = this;
    const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb+srv://sns:2121993.Darkfire@procesocluster.efauuxe.mongodb.net/?appName=ProcesoCluster';
    // Opciones para Node.js v24+ (fix SSL/TLS error)
    const client = new mongo(uri, { 
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000
    });
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

  // buscar usuario en MongoDB
  this.buscarUsuario = function(obj, callback) {
    if (!this.usuarios) {
      console.error("[CAD] Error: colección usuarios no inicializada");
      callback(undefined);
      return;
    }
    buscar(this.usuarios, obj, callback);
  };

  // insertar usuario en MongoDB
  this.insertarUsuario = function(usuario, callback) {
    insertar(this.usuarios, usuario, callback);
  };

  // actualizar usuario en MongoDB
  this.actualizarUsuario = function(obj, callback) {
    actualizar(this.usuarios, obj, callback);
  };

  // eliminar usuario en MongoDB
  this.eliminarUsuario = function(email, callback) {
    eliminar(this.usuarios, email, callback);
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
    return { email: doc.email || doc.value?.email };
  } catch (err) {
    console.error('[CAD] Error en buscarOCrear:', err.message);
    throw err;
  }
}

// función auxiliar para buscar un documento en una colección
function buscar(coleccion, criterio, callback) {
  try {
    coleccion.find(criterio).toArray()
      .then(usuarios => {
        if (usuarios.length == 0) {
          callback(undefined);
        }
        else {
          callback(usuarios[0]);
        }
      })
      .catch(error => {
        console.error("[CAD] Error al buscar:", error.message);
        callback(undefined);
      });
  } catch (error) {
    console.error("[CAD] Error en búsqueda:", error.message);
    callback(undefined);
  }
}

// función auxiliar para insertar un documento en una colección
function insertar(coleccion, elemento, callback) {
  coleccion.insertOne(elemento)
    .then(result => {
      callback(elemento);
    })
    .catch(err => {
      console.error("[CAD] Error al insertar:", err.message);
      callback({error: "Error al insertar"});
    });
}

// función auxiliar para actualizar un documento en una colección
function actualizar(coleccion, obj, callback) {
  const updateFields = { ...obj };
  delete updateFields._id; // No actualizar el _id
  
  coleccion.findOneAndUpdate(
    {_id: new ObjectId(obj._id)}, 
    {$set: updateFields},
    {upsert: false, returnDocument: "after"},
    function(err, doc) {
      if (err) { 
        console.error("[CAD] Error al actualizar:", err.message);
        throw err; 
      }
      else {
        console.log("[CAD] Usuario actualizado:", doc.value);
        callback(doc.value);
      }
    }
  );
}

// función auxiliar para eliminar un documento de una colección
function eliminar(coleccion, email, callback) {
  coleccion.deleteOne({email: email})
    .then(result => {
      if (result.deletedCount === 1) {
        callback({ok: true, mensaje: "Usuario eliminado correctamente"});
      } else {
        callback({ok: false, mensaje: "Usuario no encontrado"});
      }
    })
    .catch(err => {
      console.error("[CAD] Error al eliminar:", err.message);
      callback({ok: false, error: "Error al eliminar usuario"});
    });
}

module.exports.CAD = CAD;
