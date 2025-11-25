package com.lapiconera.proyecto.ui.pedidos

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.lapiconera.proyecto.data.model.PedidoReabastecimiento
import com.lapiconera.proyecto.data.repository.PedidosRepository
import com.lapiconera.proyecto.databinding.FragmentPedidosReabastecimientoBinding
import com.lapiconera.proyecto.ui.base.AuthenticatedFragment
import kotlinx.coroutines.launch

class PedidosReabastecimientoFragment : AuthenticatedFragment() {

    private var _binding: FragmentPedidosReabastecimientoBinding? = null
    private val binding get() = _binding!!

    private lateinit var adapter: PedidosAdapter
    private val repository = PedidosRepository()
    private var listaPedidos: List<PedidoReabastecimiento> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPedidosReabastecimientoBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.toolbar.setNavigationOnClickListener {
            findNavController().popBackStack()
        }

        setupRecyclerView()
        cargarPedidos()
    }

    private fun setupRecyclerView() {
        adapter = PedidosAdapter(
            pedidos = emptyList(),
            onMarcarCompletado = { pedido ->
                confirmarMarcarCompletado(pedido)
            },
            onClickPedido = { pedido ->
                val action = PedidosReabastecimientoFragmentDirections
                    .actionPedidosReabastecimientoFragmentToDetallePedidoFragment(pedido)
                findNavController().navigate(action)
            }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
    }

    private fun cargarPedidos() {
        lifecycleScope.launch {
            val result = repository.getPedidosReabastecimiento()

            result.onSuccess { pedidos ->
                listaPedidos = pedidos
                adapter.updateList(pedidos)

                if (pedidos.isEmpty()) {
                    binding.tvListaVacia.visibility = View.VISIBLE
                    binding.recyclerView.visibility = View.GONE
                } else {
                    binding.tvListaVacia.visibility = View.GONE
                    binding.recyclerView.visibility = View.VISIBLE
                }
            }.onFailure { error ->
                Toast.makeText(
                    requireContext(),
                    "Error al cargar pedidos: ${error.message}",
                    Toast.LENGTH_SHORT
                ).show()
                binding.tvListaVacia.visibility = View.VISIBLE
                binding.recyclerView.visibility = View.GONE
            }
        }
    }

    private fun confirmarMarcarCompletado(pedido: PedidoReabastecimiento) {
        val totalUnidades = pedido.items.sumOf { it.cantidad }

        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Reabastecimiento")
            .setMessage(
                "¿Marcar este pedido como completado?\n\n" +
                        "Se incrementará el stock de ${pedido.items.size} producto(s) " +
                        "con un total de $totalUnidades unidades."
            )
            .setPositiveButton("Confirmar") { _, _ ->
                marcarComoCompletado(pedido)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun marcarComoCompletado(pedido: PedidoReabastecimiento) {
        lifecycleScope.launch {
            pedido.id?.let { id ->
                val result = repository.marcarComoReabastecido(id, pedido.items)

                result.onSuccess {
                    Toast.makeText(
                        requireContext(),
                        "Pedido completado y stock actualizado",
                        Toast.LENGTH_SHORT
                    ).show()
                    cargarPedidos() // Recargar lista
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

