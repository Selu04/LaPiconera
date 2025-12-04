package com.lapiconera.proyecto.ui.pedidos

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapiconera.proyecto.data.model.ItemReabastecimiento
import com.lapiconera.proyecto.data.repository.PedidosRepository
import com.lapiconera.proyecto.databinding.FragmentDetallePedidoBinding
import com.lapiconera.proyecto.ui.base.AuthenticatedFragment
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class DetallePedidoFragment : AuthenticatedFragment() {

    private var _binding: FragmentDetallePedidoBinding? = null
    private val binding get() = _binding!!

    private val args: DetallePedidoFragmentArgs by navArgs()
    private lateinit var adapter: DetallePedidoAdapter
    private val repository = PedidosRepository()

    private var itemsEditados = mutableListOf<ItemReabastecimiento>()
    private var pedidoModificado = false

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDetallePedidoBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.toolbar.setNavigationOnClickListener {
            if (pedidoModificado) {
                confirmarSalida()
            } else {
                findNavController().popBackStack()
            }
        }

        setupUI()
        setupRecyclerView()
        setupButtons()
    }

    private fun setupUI() {
        val pedido = args.pedido

        binding.tvUserName.text = pedido.userName
        binding.tvFecha.text = formatearFecha(pedido.createdAt)

        if (pedido.status == "completed") {
            binding.tvStatus.text = "Estado: Completado ✓"
            binding.tvStatus.setTextColor(requireContext().getColor(android.R.color.holo_green_dark))
            binding.btnMarcarCompletado.visibility = View.GONE
        } else {
            binding.tvStatus.text = "Estado: Pendiente"
            binding.tvStatus.setTextColor(requireContext().getColor(android.R.color.holo_orange_dark))
            binding.btnMarcarCompletado.visibility = View.VISIBLE
        }

        itemsEditados.clear()
        itemsEditados.addAll(pedido.items.map { it.copy() })

        actualizarTotal()
    }

    private fun setupRecyclerView() {
        adapter = DetallePedidoAdapter(
            items = itemsEditados,
            onCantidadChanged = {
                pedidoModificado = true
                actualizarTotal()
            },
            onEliminarItem = { item ->
                confirmarEliminarItem(item)
            }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
    }

    private fun setupButtons() {
        binding.btnGuardarCambios.setOnClickListener {
            guardarCambios()
        }

        binding.btnMarcarCompletado.setOnClickListener {
            confirmarCompletarPedido()
        }
    }

    private fun actualizarTotal() {
        val totalProductos = itemsEditados.size
        val totalUnidades = itemsEditados.sumOf { it.cantidad }
        binding.tvTotal.text = "$totalProductos producto(s) - $totalUnidades unidades"
    }

    private fun confirmarEliminarItem(item: ItemReabastecimiento) {
        AlertDialog.Builder(requireContext())
            .setTitle("Eliminar Producto")
            .setMessage("¿Eliminar '${item.name}' del pedido?")
            .setPositiveButton("Eliminar") { _, _ ->
                adapter.removeItem(item)
                pedidoModificado = true
                actualizarTotal()
                Toast.makeText(requireContext(), "Producto eliminado", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun guardarCambios() {
        if (!pedidoModificado) {
            Toast.makeText(requireContext(), "No hay cambios para guardar", Toast.LENGTH_SHORT).show()
            return
        }

        val mensaje = if (itemsEditados.isEmpty()) {
            "¿Eliminar este pedido?\n\nNo tiene productos."
        } else {
            val totalUnidades = itemsEditados.sumOf { it.cantidad }
            "¿Guardar los cambios realizados?\n\n${itemsEditados.size} producto(s) - $totalUnidades unidades"
        }

        AlertDialog.Builder(requireContext())
            .setTitle(if (itemsEditados.isEmpty()) "Eliminar Pedido" else "Guardar Cambios")
            .setMessage(mensaje)
            .setPositiveButton(if (itemsEditados.isEmpty()) "Eliminar" else "Guardar") { _, _ ->
                enviarCambiosAlServidor()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun enviarCambiosAlServidor() {
        lifecycleScope.launch {
            args.pedido.id?.let { id ->
                val result = repository.actualizarCantidadesPedido(id, itemsEditados)

                result.onSuccess { response ->
                    pedidoModificado = false

                    // Si la respuesta indica que el pedido fue eliminado
                    if (response is Pair<*, *> && response.first == "deleted") {
                        Toast.makeText(
                            requireContext(),
                            "Pedido eliminado (sin productos)",
                            Toast.LENGTH_SHORT
                        ).show()
                        findNavController().popBackStack()
                    } else {
                        Toast.makeText(
                            requireContext(),
                            "Cambios guardados exitosamente",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }.onFailure { error ->
                    Toast.makeText(
                        requireContext(),
                        "Error al guardar: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun confirmarCompletarPedido() {
        if (itemsEditados.isEmpty()) {
            Toast.makeText(requireContext(), "No hay productos en el pedido", Toast.LENGTH_SHORT).show()
            return
        }

        val totalUnidades = itemsEditados.sumOf { it.cantidad }

        AlertDialog.Builder(requireContext())
            .setTitle("Completar Pedido")
            .setMessage(
                "¿Marcar este pedido como completado?\n\n" +
                        "Se incrementará el stock de ${itemsEditados.size} producto(s) " +
                        "con un total de $totalUnidades unidades."
            )
            .setPositiveButton("Confirmar") { _, _ ->
                completarPedido()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun completarPedido() {
        lifecycleScope.launch {
            args.pedido.id?.let { id ->
                val result = repository.marcarComoReabastecido(id, itemsEditados)

                result.onSuccess {
                    Toast.makeText(
                        requireContext(),
                        "Pedido completado y stock actualizado",
                        Toast.LENGTH_SHORT
                    ).show()
                    findNavController().popBackStack()
                }.onFailure { error ->
                    Toast.makeText(
                        requireContext(),
                        "Error: ${error.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun confirmarSalida() {
        AlertDialog.Builder(requireContext())
            .setTitle("Cambios sin guardar")
            .setMessage("¿Deseas salir sin guardar los cambios?")
            .setPositiveButton("Salir") { _, _ ->
                findNavController().popBackStack()
            }
            .setNegativeButton("Cancelar", null)
            .show()
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

