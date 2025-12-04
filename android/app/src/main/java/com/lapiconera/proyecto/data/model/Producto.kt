package com.lapiconera.proyecto.data.model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Producto(
    @SerializedName("id")
    val id: String? = null,

    @SerializedName("name")
    val name: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("price")
    val price: Double,

    @SerializedName("image")
    val image: String? = null,

    @SerializedName("category")
    val category: String? = null,

    @SerializedName("allergens")
    val allergens: List<String>? = null,

    @SerializedName("tags")
    val tags: List<String>? = null,

    @SerializedName("stock_quantity")
    val stockQuantity: Int? = null,

    @SerializedName("min_stock")
    val minStock: Int? = null,

    @SerializedName("is_available")
    val isAvailable: Boolean? = true,

    @SerializedName("barcode")
    val barcode: String? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("updated_at")
    val updatedAt: String? = null
) : Parcelable
