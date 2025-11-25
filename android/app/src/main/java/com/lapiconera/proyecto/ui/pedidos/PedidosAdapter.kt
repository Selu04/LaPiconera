package com.lapiconera.proyecto.ui.pedidos

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.model.PedidoReabastecimiento
import java.text.SimpleDateFormat
import java.util.*

class PedidosAdapter(
    private var pedidos: List<PedidoReabastecimiento>,
    private val onMarcarCompletado: (PedidoReabastecimiento) -> Unit,
    private val onClickPedido: (PedidoReabastecimiento) -> Unit
) : RecyclerView.Adapter<PedidosAdapter.PedidoViewHolder>() {

    inner class PedidoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvUserName: TextView = view.findViewById(R.id.tvUserName)
        val tvStatus: TextView = view.findViewById(R.id.tvStatus)
        val tvFecha: TextView = view.findViewById(R.id.tvFecha)
        val tvProductos: TextView = view.findViewById(R.id.tvProductos)
        val btnMarcarCompletado: MaterialButton = view.findViewById(R.id.btnMarcarCompletado)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PedidoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pedido_reabastecimiento, parent, false)
        return PedidoViewHolder(view)
    }

    override fun onBindViewHolder(holder: PedidoViewHolder, position: Int) {
        val pedido = pedidos[position]

        holder.tvUserName.text = pedido.userName

        if (pedido.status == "completed") {
            holder.tvStatus.text = "Completado"
            holder.tvStatus.setBackgroundResource(R.drawable.bg_status_completed)
            holder.btnMarcarCompletado.visibility = View.GONE
        } else {
            holder.tvStatus.text = "Pendiente"
            holder.tvStatus.setBackgroundResource(R.drawable.bg_status_pending)
            holder.btnMarcarCompletado.visibility = View.VISIBLE
        }

        holder.tvFecha.text = formatearFecha(pedido.createdAt)

        val totalProductos = pedido.items.size
        val totalUnidades = pedido.items.sumOf { it.cantidad }
        holder.tvProductos.text = "$totalProductos producto(s) - $totalUnidades unidades"

        holder.itemView.setOnClickListener {
            onClickPedido(pedido)
        }

        holder.btnMarcarCompletado.setOnClickListener {
            onMarcarCompletado(pedido)
        }
    }

    override fun getItemCount(): Int = pedidos.size

    fun updateList(newList: List<PedidoReabastecimiento>) {
        pedidos = newList
        notifyDataSetChanged()
    }

    private fun formatearFecha(fecha: String?): String {
        if (fecha == null) return ""

        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val outputFormat = SimpleDateFormat("dd/MM/yyyy - HH:mm", Locale.getDefault())
            val date = inputFormat.parse(fecha)
            date?.let { outputFormat.format(it) } ?: fecha
        } catch (e: Exception) {
            fecha
        }
    }
}

