package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.PedidoReabastecimiento

class PedidosRepository(
    private val api: ApiService = RetrofitClient.api
) {

    suspend fun getPedidosReabastecimiento(): Result<List<PedidoReabastecimiento>> {
        return try {
            val response = api.getPedidosReabastecimiento()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener pedidos: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun marcarComoReabastecido(id: String, items: List<Any>): Result<PedidoReabastecimiento> {
        return try {
            val requestBody = mapOf(
                "id" to id,
                "items" to items
            )

            val response = api.marcarComoReabastecido(requestBody)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al marcar como reabastecido: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

