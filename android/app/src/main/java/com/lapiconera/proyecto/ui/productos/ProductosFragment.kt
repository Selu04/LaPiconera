package com.lapiconera.proyecto.ui.productos

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.*
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.model.Producto
import com.lapiconera.proyecto.databinding.FragmentProductosBinding
import com.lapiconera.proyecto.ui.base.AuthenticatedFragment
import com.lapiconera.proyecto.util.Constantes
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ProductosFragment : AuthenticatedFragment() {

    private var _binding: FragmentProductosBinding? = null
    private val binding get() = _binding!!

    private lateinit var userId: String

    private lateinit var adapter: ProductosAdapter
    private var listaProductos: List<Producto> = listOf()
    private var categoriaSeleccionada: String = "Todas"
    private var categoriasList: List<com.lapiconera.proyecto.data.model.Categoria> = emptyList()
    private var categoriaIdSeleccionada: String? = null

    private val TAG = "ProductosFragment"

    private val viewModel: ProductosViewModel by viewModels()

    private lateinit var cameraExecutor: ExecutorService
    private val barcodeScanner = BarcodeScanning.getClient()

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            iniciarEscanerBarras()
        } else {
            Toast.makeText(requireContext(), "Se necesita permiso de cámara para escanear", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val sharedPref = requireActivity().getSharedPreferences(Constantes.PREFS_NAME, Context.MODE_PRIVATE)
        userId = sharedPref.getString(Constantes.USER_ID, "") ?: ""
        Log.d(TAG, "UserId obtenido en onCreate: $userId")
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProductosBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {

        cameraExecutor = Executors.newSingleThreadExecutor()

        binding.toolbar.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                R.id.action_add_producto -> {
                    Log.d(TAG, "Navegando a agregar producto")
                    val action = ProductosFragmentDirections.actionProductosFragmentToAddEditProductoFragment(null)
                    findNavController().navigate(action)
                    true
                }
                R.id.action_tpv -> {
                    Log.d(TAG, "Navegando a TPV")
                    findNavController().navigate(R.id.action_productosFragment_to_tpvFragment)
                    true
                }
                R.id.action_pedidos_reabastecimiento -> {
                    Log.d(TAG, "Navegando a Pedidos de Reabastecimiento")
                    findNavController().navigate(R.id.action_productosFragment_to_pedidosReabastecimientoFragment)
                    true
                }
                R.id.action_cerrar_sesion -> {
                    Log.d(TAG, "Cerrando sesión")
                    findNavController().navigate(R.id.action_productosFragment_to_loginFragment)
                    true
                }
                else -> false
            }
        }

        adapter = ProductosAdapter(
            productos = listOf(),
            onStockChange = { producto, nuevoStock -> actualizarStock(producto, nuevoStock) },
            onEditClick = { producto ->
                Log.d(TAG, "Editar producto ID=${producto.id}")
                val action = ProductosFragmentDirections.actionProductosFragmentToAddEditProductoFragment(producto)
                findNavController().navigate(action)
            },
            onDeleteClick = { producto ->
                Log.d(TAG, "Eliminar producto ID=${producto.id}")
                confirmarEliminarProducto(producto)
            }
        )

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.spinnerCategoria.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                categoriaSeleccionada = parent.getItemAtPosition(position) as String

                categoriaIdSeleccionada = when {
                    categoriaSeleccionada == "Todas" || categoriaSeleccionada == "Bajo Stock" -> null
                    else -> {
                        val categoriaIndex = position - 2
                        if (categoriaIndex >= 0 && categoriaIndex < categoriasList.size) {
                            categoriasList[categoriaIndex].id
                        } else null
                    }
                }

                Log.d(TAG, "Categoría seleccionada: $categoriaSeleccionada (ID: $categoriaIdSeleccionada)")
                filtrarProductos()
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }

        binding.searchView.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                Log.d(TAG, "Buscar texto submit: $query")
                filtrarProductos()
                return true
            }
            override fun onQueryTextChange(newText: String?): Boolean {
                Log.d(TAG, "Buscar texto cambio: $newText")
                filtrarProductos()
                return true
            }
        })

        binding.btnScanSearch.setOnClickListener {
            Log.d(TAG, "Click en botón escanear - Iniciando escáner de código de barras")
            solicitarPermisoYEscanear()
        }

        binding.etStockMin.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                Log.d(TAG, "Stock mínimo cambiado: ${s.toString()}")
                filtrarProductos()
            }
        })

        binding.etStockMax.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                Log.d(TAG, "Stock máximo cambiado: ${s.toString()}")
                filtrarProductos()
            }
        })

        setupObservers()

        Log.d(TAG, "Cargando categorías y productos...")
        viewModel.cargarCategorias()
        viewModel.cargarProductos()
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume: Recargando productos...")
        viewModel.cargarProductos()
    }

    private fun setupObservers() {
        viewModel.productos.observe(viewLifecycleOwner) {
            Log.d(TAG, "Productos observados: ${it.size}")
            listaProductos = it
            filtrarProductos()
        }

        viewModel.categorias.observe(viewLifecycleOwner) { categorias ->
            Log.d(TAG, "Categorías observadas: ${categorias.size}")
            categoriasList = categorias
            configurarSpinnerCategorias()
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            // Puedes mostrar/ocultar un progress bar aquí
            Log.d(TAG, "Loading: $isLoading")
        }

        viewModel.errorMessage.observe(viewLifecycleOwner) { message ->
            if (message.isNotEmpty()) {
                Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun configurarSpinnerCategorias() {
        val nombresCategorias = mutableListOf("Todas", "Bajo Stock")
        nombresCategorias.addAll(categoriasList.map { it.name })

        val adapterSpinner = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            nombresCategorias
        )
        adapterSpinner.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerCategoria.adapter = adapterSpinner

        Log.d(TAG, "Spinner configurado con ${categoriasList.size} categorías desde API")
    }

    private fun filtrarProductos() {
        val textoBusqueda = binding.searchView.query.toString().lowercase()
        val stockMinStr = binding.etStockMin.text.toString()
        val stockMaxStr = binding.etStockMax.text.toString()

        val stockMin = stockMinStr.toIntOrNull()
        val stockMax = stockMaxStr.toIntOrNull()

        Log.d(TAG, "Filtrando productos - Búsqueda: $textoBusqueda, Categoría: $categoriaSeleccionada (ID: $categoriaIdSeleccionada), Stock: [$stockMin - $stockMax]")

        val productosFiltrados = listaProductos.filter {
            // Buscar por nombre o código de barras
            val coincideTexto = it.name.lowercase().contains(textoBusqueda) ||
                               (it.barcode?.lowercase()?.contains(textoBusqueda) == true)

            val coincideCategoria = when (categoriaSeleccionada) {
                "Todas" -> true
                "Bajo Stock" -> (it.stockQuantity ?: 0) <= (it.minStock ?: 5)
                else -> {
                    it.category == categoriaIdSeleccionada
                }
            }

            val stockProducto = it.stockQuantity ?: 0
            val coincideStock = when {
                stockMin != null && stockMax != null -> {
                    stockProducto >= stockMin && stockProducto <= stockMax
                }
                stockMin != null && stockMax == null -> {
                    stockProducto >= stockMin
                }
                stockMin == null && stockMax != null -> {
                    stockProducto <= stockMax
                }
                else -> true
            }

            coincideTexto && coincideCategoria && coincideStock
        }

        adapter.updateList(productosFiltrados)
        Log.d(TAG, "Productos filtrados: ${productosFiltrados.size} de ${listaProductos.size}")
    }

    private fun actualizarStock(producto: Producto, nuevoStock: Int) {
        producto.id?.let { id ->
            val stockChange = nuevoStock - (producto.stockQuantity ?: 0)
            Log.d(TAG, "Actualizando stock producto ID=$id a $nuevoStock (cambio: $stockChange)")

            viewModel.actualizarStock(id, stockChange) {
                Log.d(TAG, "Stock actualizado correctamente")
                Toast.makeText(requireContext(), "Stock actualizado", Toast.LENGTH_SHORT).show()
            }
        }
    }


    private fun confirmarEliminarProducto(producto: Producto) {
        androidx.appcompat.app.AlertDialog.Builder(requireContext())
            .setTitle("Eliminar Producto")
            .setMessage("¿Estás seguro de eliminar '${producto.name}'?\n\nEsta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { _, _ ->
                eliminarProducto(producto)
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun eliminarProducto(producto: Producto) {
        producto.id?.let { id ->
            Log.d(TAG, "Eliminando producto ID=$id")
            viewModel.eliminarProducto(id) {
                Toast.makeText(requireContext(), "Producto eliminado", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun solicitarPermisoYEscanear() {
        when {
            ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                iniciarEscanerBarras()
            }
            else -> {
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun iniciarEscanerBarras() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_barcode_scanner, null)

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .setTitle("Escanear código de barras")
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.dismiss()
            }
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
                        procesarImagenBarcode(imageProxy) { barcode ->
                            binding.searchView.setQuery(barcode, true)
                            dialog.dismiss()
                            cameraProvider.unbindAll()
                        }
                    }
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    viewLifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )
            } catch (e: Exception) {
                Toast.makeText(
                    requireContext(),
                    "Error al iniciar cámara: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
                Log.e(TAG, "Error iniciando cámara", e)
            }
        }, ContextCompat.getMainExecutor(requireContext()))

        dialog.setOnDismissListener {
            cameraProviderFuture.get()?.unbindAll()
        }
    }

    @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
    private fun procesarImagenBarcode(
        imageProxy: ImageProxy,
        onBarcodeDetected: (String) -> Unit
    ) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(
                mediaImage,
                imageProxy.imageInfo.rotationDegrees
            )

            barcodeScanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        barcode.rawValue?.let { value ->
                            requireActivity().runOnUiThread {
                                onBarcodeDetected(value)
                            }
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Error escaneando código de barras", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        if (::cameraExecutor.isInitialized) {
            cameraExecutor.shutdown()
        }
        _binding = null
    }
}
