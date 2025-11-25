package com.lapiconera.proyecto.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class ItemTPV(
    val productoId: String,
    val nombre: String,
    val barcode: String?,
    var cantidad: Int,
    val stockActual: Int,
    val imagen: String?
) : Parcelable

