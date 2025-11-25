package com.lapiconera.proyecto.ui.tpv

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.model.ItemTPV
import com.lapiconera.proyecto.data.repository.ProductoRepository
import com.lapiconera.proyecto.databinding.FragmentTpvBinding
import com.lapiconera.proyecto.ui.base.AuthenticatedFragment
import kotlinx.coroutines.launch
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class TpvFragment : AuthenticatedFragment() {

    private var _binding: FragmentTpvBinding? = null
    private val binding get() = _binding!!

    private lateinit var adapter: TpvAdapter
    private val items = mutableListOf<ItemTPV>()
    private var esReducir = true

    private val repository = ProductoRepository()

    private lateinit var cameraExecutor: ExecutorService
    private val barcodeScanner = BarcodeScanning.getClient()

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            iniciarEscaner()
        } else {
            Toast.makeText(requireContext(), "Se necesita permiso de cámara", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTpvBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        cameraExecutor = Executors.newSingleThreadExecutor()

        binding.toolbar.setNavigationOnClickListener {
            findNavController().popBackStack()
        }

        setupRecyclerView()
        setupListeners()
        actualizarContador()
    }

    private fun setupRecyclerView() {
        adapter = TpvAdapter(
            items = items,
            onCantidadChanged = { actualizarContador() },
            onEliminar = { item ->
                adapter.removeItem(item)
                actualizarContador()
            }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
    }

    private fun setupListeners() {
        binding.radioGroupTipo.setOnCheckedChangeListener { _, checkedId ->
            esReducir = (checkedId == R.id.radioReducir)
        }

        binding.btnEscanear.setOnClickListener {
            solicitarPermisoYEscanear()
        }

        binding.btnConfirmar.setOnClickListener {
            confirmarOperacion()
        }
    }

    private fun solicitarPermisoYEscanear() {
        when {
            ContextCompat.checkSelfPermission(
                requireContext(), Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                iniciarEscaner()
            }
            else -> {
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun iniciarEscaner() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_barcode_scanner, null)

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .setTitle("Escanear producto")
            .setNegativeButton("Cancelar") { dialog, _ -> dialog.dismiss() }
            .create()

        dialog.show()

        val previewView = dialogView.findViewById<androidx.camera.view.PreviewView>(R.id.previewView)
        val cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext())

        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        procesarImagen(imageProxy) { barcode ->
                            buscarYAgregarProducto(barcode)
                            dialog.dismiss()
                            cameraProvider.unbindAll()
                        }
                    }
                }

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    viewLifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalyzer
                )
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }, ContextCompat.getMainExecutor(requireContext()))

        dialog.setOnDismissListener {
            cameraProviderFuture.get()?.unbindAll()
        }
    }

    @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
    private fun procesarImagen(imageProxy: ImageProxy, onDetected: (String) -> Unit) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            barcodeScanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        barcode.rawValue?.let { value ->
                            requireActivity().runOnUiThread {
                                onDetected(value)
                            }
                        }
                    }
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    private fun buscarYAgregarProducto(barcode: String) {
        lifecycleScope.launch {
            Toast.makeText(requireContext(), "Buscando producto con código: $barcode", Toast.LENGTH_SHORT).show()

            val result = repository.buscarPorCodigoBarras(barcode)
            result.onSuccess { producto ->
                if (producto != null) {
                    val item = ItemTPV(
                        productoId = producto.id ?: "",
                        nombre = producto.name,
                        barcode = producto.barcode,
                        cantidad = 1,
                        stockActual = producto.stockQuantity ?: 0,
                        imagen = producto.image
                    )
                    adapter.addItem(item)
                    actualizarContador()
                    Toast.makeText(requireContext(), "Producto agregado: ${producto.name}", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(requireContext(), "Producto no encontrado con código: $barcode", Toast.LENGTH_LONG).show()
                }
            }.onFailure { error ->
                Toast.makeText(requireContext(), "Error al buscar producto: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun confirmarOperacion() {
        if (items.isEmpty()) {
            Toast.makeText(requireContext(), "La lista está vacía", Toast.LENGTH_SHORT).show()
            return
        }

        val operacion = if (esReducir) "reducir" else "aumentar"
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar operación")
            .setMessage("¿Deseas $operacion el stock de ${items.size} producto(s)?")
            .setPositiveButton("Confirmar") { _, _ ->
                ejecutarOperacion()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun ejecutarOperacion() {
        lifecycleScope.launch {
            var exitosos = 0
            var errores = 0

            for (item in items) {
                val stockChange = if (esReducir) -item.cantidad else item.cantidad
                val result = repository.actualizarStock(item.productoId, stockChange)

                result.onSuccess {
                    exitosos++
                }.onFailure {
                    errores++
                }
            }

            val mensaje = "Stock actualizado: $exitosos exitosos, $errores errores"
            Toast.makeText(requireContext(), mensaje, Toast.LENGTH_LONG).show()

            if (errores == 0) {
                adapter.clearAll()
                actualizarContador()
            }
        }
    }

    private fun actualizarContador() {
        val total = items.sumOf { it.cantidad }
        binding.tvContador.text = "${items.size} producto(s) - $total unidades"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        if (::cameraExecutor.isInitialized) {
            cameraExecutor.shutdown()
        }
        _binding = null
    }
}

