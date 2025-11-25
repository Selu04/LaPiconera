package com.lapiconera.proyecto.data.model

data class LoginResponse(
    val token: String?,
    val trabajador: Boolean,
    val id: String?
)
