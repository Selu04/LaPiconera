package com.lapiconera.proyecto.data.model

import com.google.gson.annotations.SerializedName

data class ProductoRequest(
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
    val stockQuantity: Int? = 0,

    @SerializedName("min_stock")
    val minStock: Int? = 0,

    @SerializedName("is_available")
    val isAvailable: Boolean? = true,

    @SerializedName("barcode")
    val barcode: String? = null
)
