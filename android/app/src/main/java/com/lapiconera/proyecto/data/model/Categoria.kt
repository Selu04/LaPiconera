package com.lapiconera.proyecto.data.model

import com.google.gson.annotations.SerializedName

data class Categoria(
    @SerializedName("id")
    val id: String? = null,

    @SerializedName("name")
    val name: String,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("icon")
    val icon: String? = null,

    @SerializedName("color")
    val color: String? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("updated_at")
    val updatedAt: String? = null
)

