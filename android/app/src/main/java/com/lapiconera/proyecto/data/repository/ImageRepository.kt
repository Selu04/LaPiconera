package com.lapiconera.proyecto.data.repository

import android.graphics.Bitmap
import android.util.Base64
import android.util.Log
import com.lapiconera.proyecto.data.api.ImageUploadRequest
import com.lapiconera.proyecto.data.api.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

class ImageRepository {

    private val api = RetrofitClient.api

    suspend fun subirImagenProducto(bitmap: Bitmap, nombreProducto: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val byteArrayOutputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
                val imageBytes = byteArrayOutputStream.toByteArray()

                val base64Image = "data:image/png;base64," + Base64.encodeToString(imageBytes, Base64.NO_WRAP)

                Log.d("ImageRepository", "Subiendo imagen para: $nombreProducto")

                val request = ImageUploadRequest(
                    imagen = base64Image,
                    nombre = nombreProducto
                )

                val response = api.subirImagen(request)

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    if (body.success) {
                        Log.d("ImageRepository", "Imagen subida exitosamente: ${body.url}")
                        Result.success(body.url)
                    } else {
                        Log.e("ImageRepository", "La API indicó que falló la subida")
                        Result.failure(Exception("Error al subir imagen"))
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Sin detalles"
                    Log.e("ImageRepository", "Error al subir imagen: ${response.code()} - $errorBody")
                    Result.failure(Exception("Error al subir imagen: ${response.code()}"))
                }
            } catch (e: Exception) {
                Log.e("ImageRepository", "Excepción al subir imagen: ${e.message}", e)
                Result.failure(e)
            }
        }
    }

    suspend fun eliminarImagenProducto(url: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                Log.d("ImageRepository", "Eliminación de imagen no implementada en la API")
                Result.success(true)
            } catch (e: Exception) {
                Log.e("ImageRepository", "Error: ${e.message}", e)
                Result.failure(e)
            }
        }
    }
}

