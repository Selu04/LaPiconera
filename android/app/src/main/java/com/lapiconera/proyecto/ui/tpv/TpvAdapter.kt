package com.lapiconera.proyecto.ui.tpv

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
import com.lapiconera.proyecto.data.model.ItemTPV

class TpvAdapter(
    private var items: MutableList<ItemTPV>,
    private val onCantidadChanged: (ItemTPV) -> Unit,
    private val onEliminar: (ItemTPV) -> Unit
) : RecyclerView.Adapter<TpvAdapter.ItemViewHolder>() {

    inner class ItemViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivProducto: ImageView = view.findViewById(R.id.ivProducto)
        val tvNombre: TextView = view.findViewById(R.id.tvNombre)
        val tvStockActual: TextView = view.findViewById(R.id.tvStockActual)
        val tvCantidad: TextView = view.findViewById(R.id.tvCantidad)
        val btnMenos: MaterialButton = view.findViewById(R.id.btnMenos)
        val btnMas: MaterialButton = view.findViewById(R.id.btnMas)
        val btnEliminar: ImageButton = view.findViewById(R.id.btnEliminar)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_tpv, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]

        holder.tvNombre.text = item.nombre
        holder.tvStockActual.text = "Stock actual: ${item.stockActual}"
        holder.tvCantidad.text = item.cantidad.toString()

        Glide.with(holder.itemView)
            .load(item.imagen)
            .centerCrop()
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_placeholder)
            .into(holder.ivProducto)

        holder.btnMenos.setOnClickListener {
            if (item.cantidad > 1) {
                item.cantidad--
                holder.tvCantidad.text = item.cantidad.toString()
                onCantidadChanged(item)
            }
        }

        holder.btnMas.setOnClickListener {
            item.cantidad++
            holder.tvCantidad.text = item.cantidad.toString()
            onCantidadChanged(item)
        }

        holder.btnEliminar.setOnClickListener {
            onEliminar(item)
        }
    }

    override fun getItemCount(): Int = items.size

    fun addItem(item: ItemTPV) {
        val existingIndex = items.indexOfFirst { it.productoId == item.productoId }
        if (existingIndex >= 0) {
            items[existingIndex].cantidad += item.cantidad
            notifyItemChanged(existingIndex)
        } else {
            items.add(item)
            notifyItemInserted(items.size - 1)
        }
    }

    fun removeItem(item: ItemTPV) {
        val index = items.indexOf(item)
        if (index >= 0) {
            items.removeAt(index)
            notifyItemRemoved(index)
        }
    }

    fun getItems(): List<ItemTPV> = items.toList()

    fun clearAll() {
        items.clear()
        notifyDataSetChanged()
    }
}

