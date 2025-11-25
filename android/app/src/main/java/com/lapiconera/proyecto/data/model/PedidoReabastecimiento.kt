package com.lapiconera.proyecto.data.model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class PedidoReabastecimiento(
    @SerializedName("id")
    val id: String? = null,

    @SerializedName("user_id")
    val userId: String = "", // Valor por defecto

    @SerializedName("user_name")
    val userName: String = "", // Valor por defecto

    @SerializedName("items")
    val items: List<ItemReabastecimiento> = emptyList(), // Valor por defecto

    @SerializedName("status")
    val status: String = "pending", // Valor por defecto

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("completed_at")
    val completedAt: String? = null
) : Parcelable

@Parcelize
data class ItemReabastecimiento(
    @SerializedName("id")
    val id: String = "", // Valor por defecto para evitar null

    @SerializedName("nombre")  // API devuelve "nombre" no "name"
    val name: String = "", // Valor por defecto para evitar null

    @SerializedName("cantidad")
    var cantidad: Int = 0, // Cambiado a var para poder modificar

    @SerializedName("current_stock")
    val currentStock: Int? = null,

    @SerializedName("imagen")  // API devuelve "imagen" no "image"
    val image: String? = null
) : Parcelable {
    fun withCantidad(newCantidad: Int): ItemReabastecimiento {
        return copy(cantidad = newCantidad)
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + cantidad
        result = 31 * result + (currentStock ?: 0)
        result = 31 * result + (image?.hashCode() ?: 0)
        return result
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ItemReabastecimiento

        if (id != other.id) return false
        if (name != other.name) return false
        if (cantidad != other.cantidad) return false
        if (currentStock != other.currentStock) return false
        if (image != other.image) return false

        return true
    }
}


