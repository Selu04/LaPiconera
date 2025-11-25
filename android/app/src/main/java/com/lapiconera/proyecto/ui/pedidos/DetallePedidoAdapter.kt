package com.lapiconera.proyecto.ui.pedidos

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.google.android.material.button.MaterialButton
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.model.ItemReabastecimiento

class DetallePedidoAdapter(
    private var items: MutableList<ItemReabastecimiento>,
    private val onCantidadChanged: () -> Unit,
    private val onEliminarItem: (ItemReabastecimiento) -> Unit
) : RecyclerView.Adapter<DetallePedidoAdapter.ItemViewHolder>() {

    inner class ItemViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivProducto: ImageView = view.findViewById(R.id.ivProducto)
        val tvNombre: TextView = view.findViewById(R.id.tvNombre)
        val tvCantidad: TextView = view.findViewById(R.id.tvCantidad)
        val btnMenos: MaterialButton = view.findViewById(R.id.btnMenos)
        val btnMas: MaterialButton = view.findViewById(R.id.btnMas)
        val btnEliminar: ImageButton = view.findViewById(R.id.btnEliminar)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_detalle_pedido_producto, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]

        holder.tvNombre.text = item.name
        holder.tvCantidad.text = item.cantidad.toString()

        Glide.with(holder.itemView.context)
            .load(item.image)
            .centerCrop()
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_placeholder)
            .into(holder.ivProducto)

        holder.btnMenos.setOnClickListener {
            if (items[position].cantidad > 0) {
                items[position].cantidad -= 1
                holder.tvCantidad.text = items[position].cantidad.toString()
                onCantidadChanged()
            }
        }

        holder.btnMas.setOnClickListener {
            items[position].cantidad += 1
            holder.tvCantidad.text = items[position].cantidad.toString()
            onCantidadChanged()
        }

        holder.btnEliminar.setOnClickListener {
            onEliminarItem(item)
        }
    }

    override fun getItemCount(): Int = items.size

    fun removeItem(item: ItemReabastecimiento) {
        val index = items.indexOfFirst { it.id == item.id }
        if (index >= 0) {
            items.removeAt(index)
            notifyItemRemoved(index)
            onCantidadChanged()
        }
    }

    fun getItems(): List<ItemReabastecimiento> = items.toList()

    fun updateItems(newItems: List<ItemReabastecimiento>) {
        items.clear()
        items.addAll(newItems.map { it.copy() }) // Copiar para evitar referencias
        notifyDataSetChanged()
    }
}

