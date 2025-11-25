package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.Tag

class TagRepository(
    private val api: ApiService = RetrofitClient.api
) {

    suspend fun getTags(): Result<List<Tag>> {
        return try {
            val response = api.getTags()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener tags: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

