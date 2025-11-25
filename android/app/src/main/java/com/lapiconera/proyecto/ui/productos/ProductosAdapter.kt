package com.lapiconera.proyecto.ui.productos

import android.content.Context
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.google.android.material.button.MaterialButton
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.model.Producto

class ProductosAdapter(
    private var productos: List<Producto>,
    private val onStockChange: (Producto, Int) -> Unit,
    private val onLongClick: (Producto) -> Unit
) : RecyclerView.Adapter<ProductosAdapter.ProductoViewHolder>() {

    inner class ProductoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivImagen: ImageView = view.findViewById(R.id.ivProducto)
        val tvNombre: TextView = view.findViewById(R.id.tvNombre)
        val tvStock: TextView = view.findViewById(R.id.tvStock)
        val btnSumar: MaterialButton = view.findViewById(R.id.btnSumar)
        val btnRestar: MaterialButton = view.findViewById(R.id.btnRestar)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductoViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_producto, parent, false)
        return ProductoViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductoViewHolder, position: Int) {
        val producto = productos[position]
        val stock = producto.stockQuantity
        val min = producto.minStock ?: 0

        holder.tvNombre.text = producto.name
        holder.tvStock.text = stock.toString()

        // Cambiar color del stock según cantidad (sutiles)
        if (stock != null) {
            when {
                stock == 0 -> {
                    holder.tvStock.setTextColor(Color.parseColor("#D32F2F"))
                    holder.tvNombre.setTextColor(Color.parseColor("#D32F2F"))
                }
                stock <= min -> {
                    holder.tvStock.setTextColor(Color.parseColor("#F57C00"))
                    holder.tvNombre.setTextColor(Color.parseColor("#F57C00"))
                }
                else -> {
                    holder.tvStock.setTextColor(Color.parseColor("#212121"))
                    holder.tvNombre.setTextColor(Color.parseColor("#212121"))
                }
            }
        }

        Glide.with(holder.itemView)
            .load(producto.image)
            .centerCrop()
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_placeholder)
            .into(holder.ivImagen)

        holder.btnSumar.setOnClickListener {
            mostrarDialogoCantidad(holder.itemView.context, "Aumentar stock") { cantidad ->
                if (cantidad > 0) if (stock != null) {
                    onStockChange(producto, stock + cantidad)
                }
            }
        }

        holder.btnRestar.setOnClickListener {
            mostrarDialogoCantidad(holder.itemView.context, "Reducir stock") { cantidad ->
                val nuevoStock = stock?.minus(cantidad)
                if (nuevoStock != null) {
                    if (cantidad > 0 && nuevoStock >= 0) {
                        onStockChange(producto, nuevoStock)
                    }
                }
            }
        }


        holder.itemView.setOnLongClickListener {
            onLongClick(producto)
            true
        }
    }

    private fun mostrarDialogoCantidad(context: Context, titulo: String, onCantidadIngresada: (Int) -> Unit) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_stock_change, null)
        val input = dialogView.findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etCantidad)

        val dialog = androidx.appcompat.app.AlertDialog.Builder(context)
            .setTitle(titulo)
            .setView(dialogView)
            .setPositiveButton("Aceptar") { _, _ ->
                val cantidadStr = input.text.toString()
                val cantidad = cantidadStr.toIntOrNull()
                if (cantidad != null && cantidad > 0) {
                    onCantidadIngresada(cantidad)
                } else {
                    android.widget.Toast.makeText(context, "Ingresa un número válido", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .create()

        // Botones rápidos
        val btn1 = dialogView.findViewById<MaterialButton>(R.id.btn1)
        val btn5 = dialogView.findViewById<MaterialButton>(R.id.btn5)
        val btn10 = dialogView.findViewById<MaterialButton>(R.id.btn10)
        val btn20 = dialogView.findViewById<MaterialButton>(R.id.btn20)

        btn1?.setOnClickListener {
            onCantidadIngresada(1)
            dialog.dismiss()
        }
        btn5?.setOnClickListener {
            onCantidadIngresada(5)
            dialog.dismiss()
        }
        btn10?.setOnClickListener {
            onCantidadIngresada(10)
            dialog.dismiss()
        }
        btn20?.setOnClickListener {
            onCantidadIngresada(20)
            dialog.dismiss()
        }

        dialog.show()
    }

    override fun getItemCount(): Int = productos.size

    fun updateList(newList: List<Producto>) {
        productos = newList
        notifyDataSetChanged()
    }
}
