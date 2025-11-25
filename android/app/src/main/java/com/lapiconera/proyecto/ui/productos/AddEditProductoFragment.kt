package com.lapiconera.proyecto.ui.productos

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.provider.MediaStore
import android.view.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import com.bumptech.glide.Glide
import com.google.android.material.chip.Chip
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import com.lapiconera.proyecto.data.repository.ProductoRepository
import com.lapiconera.proyecto.data.model.Producto
import com.lapiconera.proyecto.data.model.ProductoRequest
import com.lapiconera.proyecto.data.model.Categoria
import com.lapiconera.proyecto.data.model.Tag
import com.lapiconera.proyecto.data.model.Alergeno
import com.lapiconera.proyecto.databinding.FragmentAddEditProductoBinding
import com.lapiconera.proyecto.ui.base.AuthenticatedFragment
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class AddEditProductoFragment : AuthenticatedFragment() {

    private var _binding: FragmentAddEditProductoBinding? = null
    private val binding get() = _binding!!

    private val args: AddEditProductoFragmentArgs by navArgs()
    private var producto: Producto? = null
    private var imagenBase64: String? = null
    private var imagenBitmap: Bitmap? = null
    private val repository = ProductoRepository()
    private val imageRepository = com.lapiconera.proyecto.data.repository.ImageRepository()
    private val viewModel: ProductosViewModel by viewModels()

    private var categoriasList: List<Categoria> = emptyList()
    private var tagsList: List<Tag> = emptyList()
    private var alergenosList: List<Alergeno> = emptyList()

    private var selectedTags = mutableListOf<String>()
    private var selectedAlergenos = mutableListOf<String>()

    private val REQUEST_CODE_GALLERY = 101
    private val REQUEST_CODE_CAMERA = 102

    private lateinit var cameraExecutor: ExecutorService
    private val barcodeScanner = BarcodeScanning.getClient()

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startBarcodeScanner()
        } else {
            Toast.makeText(requireContext(), "Se necesita permiso de cámara", Toast.LENGTH_SHORT).show()
        }
    }

    private val cameraPhotoPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            abrirCamara()
        } else {
            Toast.makeText(requireContext(), "Se necesita permiso de cámara para tomar fotos", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAddEditProductoBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        producto = args.producto

        cameraExecutor = Executors.newSingleThreadExecutor()

        setupObservers()
        setupImagePicker()
        setupBarcodeScannerButton()
        setupGuardarButton()

        viewModel.cargarCategorias()
        viewModel.cargarTags()
        viewModel.cargarAlergenos()
    }

    private fun setupObservers() {
        viewModel.categorias.observe(viewLifecycleOwner) { categorias ->
            categoriasList = categorias
            configurarSpinnerCategorias(categorias)
            cargarDatosProducto()
        }

        viewModel.tags.observe(viewLifecycleOwner) { tags ->
            tagsList = tags
            configurarChipGroupTags(tags)
        }

        viewModel.alergenos.observe(viewLifecycleOwner) { alergenos ->
            alergenosList = alergenos
            configurarChipGroupAlergenos(alergenos)
        }
    }

    private fun configurarSpinnerCategorias(categorias: List<Categoria>) {
        val nombresCategorias = categorias.map { it.name }
        val adapter = android.widget.ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, nombresCategorias)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerCategoria.adapter = adapter
    }

    private fun configurarChipGroupTags(tags: List<Tag>) {
        binding.chipGroupTags.removeAllViews()
        tags.forEach { tag ->
            val chip = Chip(requireContext()).apply {
                text = tag.name
                isCheckable = true

                chipBackgroundColor = ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.parseColor("#4CAF50"),
                        Color.parseColor("#F5F5F5")
                    )
                )

                setTextColor(ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.WHITE,
                        Color.parseColor("#212121")
                    )
                ))

                chipStrokeWidth = 2f
                chipStrokeColor = ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.parseColor("#4CAF50"),
                        Color.parseColor("#BDBDBD")
                    )
                )

                producto?.tags?.let { productTags ->
                    isChecked = productTags.contains(tag.id)
                    if (isChecked) tag.id?.let { selectedTags.add(it) }
                }

                setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        tag.id?.let { selectedTags.add(it) }
                    } else {
                        selectedTags.remove(tag.id)
                    }
                }
            }
            binding.chipGroupTags.addView(chip)
        }
    }

    private fun configurarChipGroupAlergenos(alergenos: List<Alergeno>) {
        binding.chipGroupAlergenos.removeAllViews()
        alergenos.forEach { alergeno ->
            val chip = Chip(requireContext()).apply {
                text = "${alergeno.icon ?: "⚠️"} ${alergeno.name}"
                isCheckable = true

                chipBackgroundColor = ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.parseColor("#EF5350"),
                        Color.parseColor("#FFEBEE")
                    )
                )

                setTextColor(ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.WHITE,
                        Color.parseColor("#C62828")
                    )
                ))

                chipStrokeWidth = 2f
                chipStrokeColor = ColorStateList(
                    arrayOf(
                        intArrayOf(android.R.attr.state_checked),
                        intArrayOf(-android.R.attr.state_checked)
                    ),
                    intArrayOf(
                        Color.parseColor("#EF5350"),
                        Color.parseColor("#EF5350")
                    )
                )

                producto?.allergens?.let { productAllergens ->
                    isChecked = productAllergens.contains(alergeno.id)
                    if (isChecked) alergeno.id?.let { selectedAlergenos.add(it) }
                }

                setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        alergeno.id?.let { selectedAlergenos.add(it) }
                    } else {
                        selectedAlergenos.remove(alergeno.id)
                    }
                }
            }
            binding.chipGroupAlergenos.addView(chip)
        }
    }

    private fun cargarDatosProducto() {
        producto?.let {
            binding.etNombre.setText(it.name)
            binding.etPrecio.setText(it.price.toString())
            binding.etStock.setText((it.stockQuantity ?: 0).toString())
            binding.etStockMinimo.setText((it.minStock ?: 5).toString())
            binding.etDescripcion.setText(it.description ?: "")
            binding.etBarcode.setText(it.barcode ?: "")

            it.category?.let { cat ->
                val index = categoriasList.indexOfFirst { categoria -> categoria.id == cat }
                if (index >= 0) binding.spinnerCategoria.setSelection(index)
            }

            if (!it.image.isNullOrEmpty()) {
                Glide.with(this)
                    .load(it.image)
                    .centerCrop()
                    .placeholder(android.R.drawable.ic_menu_gallery)
                    .into(binding.ivProducto)
            }
        }
    }

    private fun setupImagePicker() {
        binding.ivProducto.setOnClickListener {
            val opciones = arrayOf("Galería", "Cámara")
            AlertDialog.Builder(requireContext())
                .setTitle("Seleccionar imagen")
                .setItems(opciones) { _, which ->
                    when (which) {
                        0 -> {
                            val intent = Intent(Intent.ACTION_PICK)
                            intent.type = "image/*"
                            startActivityForResult(intent, REQUEST_CODE_GALLERY)
                        }
                        1 -> {
                            when {
                                ContextCompat.checkSelfPermission(
                                    requireContext(),
                                    Manifest.permission.CAMERA
                                ) == PackageManager.PERMISSION_GRANTED -> {
                                    abrirCamara()
                                }
                                else -> {
                                    cameraPhotoPermissionLauncher.launch(Manifest.permission.CAMERA)
                                }
                            }
                        }
                    }
                }.show()
        }
    }

    private fun abrirCamara() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        startActivityForResult(intent, REQUEST_CODE_CAMERA)
    }

    private fun setupBarcodeScannerButton() {
        binding.btnScanBarcode.setOnClickListener {
            when {
                ContextCompat.checkSelfPermission(
                    requireContext(),
                    Manifest.permission.CAMERA
                ) == PackageManager.PERMISSION_GRANTED -> {
                    startBarcodeScanner()
                }
                else -> {
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                }
            }
        }
    }

    private fun startBarcodeScanner() {
        val dialogView = layoutInflater.inflate(
            com.lapiconera.proyecto.R.layout.dialog_barcode_scanner,
            null
        )

        val dialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.dismiss()
            }
            .create()

        dialog.show()

        val previewView = dialogView.findViewById<androidx.camera.view.PreviewView>(
            com.lapiconera.proyecto.R.id.previewView
        )

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
                        processImageProxy(imageProxy) { barcode ->
                            binding.etBarcode.setText(barcode)
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
            }
        }, ContextCompat.getMainExecutor(requireContext()))

        dialog.setOnDismissListener {
            cameraProviderFuture.get()?.unbindAll()
        }
    }

    @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
    private fun processImageProxy(
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
                .addOnFailureListener {
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    private fun setupGuardarButton() {
        binding.btnGuardar.setOnClickListener {
            guardarProducto()
        }
    }

    private fun guardarProducto() {
        val nombre = binding.etNombre.text.toString().trim()
        val precioStr = binding.etPrecio.text.toString()
        val stock = binding.etStock.text.toString().toIntOrNull() ?: 0
        val stockMinimo = binding.etStockMinimo.text.toString().toIntOrNull() ?: 5
        val descripcion = binding.etDescripcion.text.toString()
        val barcode = binding.etBarcode.text.toString().ifBlank { null }

        if (nombre.isBlank() || precioStr.isBlank()) {
            Toast.makeText(requireContext(), "Completa nombre y precio", Toast.LENGTH_SHORT).show()
            return
        }

        val precio = precioStr.toDoubleOrNull()
        if (precio == null || precio <= 0) {
            Toast.makeText(requireContext(), "Ingresa un precio válido", Toast.LENGTH_SHORT).show()
            return
        }

        if (producto == null && imagenBitmap == null) {
            Toast.makeText(requireContext(), "Selecciona una imagen", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                binding.btnGuardar.isEnabled = false
                Toast.makeText(requireContext(), "Guardando producto...", Toast.LENGTH_SHORT).show()

                val verificacion = repository.verificarNombreDuplicado(nombre, producto?.id)
                if (verificacion.isSuccess && verificacion.getOrNull() == true) {
                    Toast.makeText(
                        requireContext(),
                        "Ya existe un producto con ese nombre",
                        Toast.LENGTH_LONG
                    ).show()
                    binding.btnGuardar.isEnabled = true
                    return@launch
                }

                var imagenUrl = producto?.image

                if (imagenBitmap != null) {
                    Toast.makeText(requireContext(), "Subiendo imagen...", Toast.LENGTH_SHORT).show()
                    val resultImagen = imageRepository.subirImagenProducto(imagenBitmap!!, nombre)

                    if (resultImagen.isSuccess) {
                        imagenUrl = resultImagen.getOrNull()
                    } else {
                        Toast.makeText(
                            requireContext(),
                            "Error al subir imagen: ${resultImagen.exceptionOrNull()?.message}",
                            Toast.LENGTH_LONG
                        ).show()
                        binding.btnGuardar.isEnabled = true
                        return@launch
                    }
                }

                val selectedPosition = binding.spinnerCategoria.selectedItemPosition
                val categoriaId = if (selectedPosition >= 0 && selectedPosition < categoriasList.size) {
                    categoriasList[selectedPosition].id
                } else null

                val nuevoProductoRequest = ProductoRequest(
                    name = nombre,
                    description = descripcion.ifBlank { null },
                    price = precio,
                    category = categoriaId,
                    image = imagenUrl,
                    stockQuantity = stock,
                    minStock = stockMinimo,
                    allergens = selectedAlergenos.toList(),
                    tags = selectedTags.toList(),
                    isAvailable = true,
                    barcode = barcode
                )

                val result = if (producto == null) {
                    repository.crearProducto(nuevoProductoRequest)
                } else {
                    repository.actualizarProducto(producto!!.id!!, nuevoProductoRequest)
                }

                result.onSuccess {
                    Toast.makeText(requireContext(), "Producto guardado exitosamente", Toast.LENGTH_SHORT).show()
                    findNavController().popBackStack()
                }.onFailure { error ->
                    Toast.makeText(
                        requireContext(),
                        "Error: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                    binding.btnGuardar.isEnabled = true
                }

            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error al guardar: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.btnGuardar.isEnabled = true
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != Activity.RESULT_OK) return
        when (requestCode) {
            REQUEST_CODE_GALLERY -> {
                data?.data?.let { uri ->
                    val bitmap = MediaStore.Images.Media.getBitmap(requireContext().contentResolver, uri)
                    binding.ivProducto.setImageBitmap(bitmap)
                    imagenBitmap = bitmap
                    imagenBase64 = bitmapToBase64(bitmap)
                }
            }
            REQUEST_CODE_CAMERA -> {
                val bitmap = data?.extras?.get("data") as? Bitmap
                bitmap?.let {
                    binding.ivProducto.setImageBitmap(it)
                    imagenBitmap = it
                    imagenBase64 = bitmapToBase64(it)
                }
            }
        }
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
        val bytes = outputStream.toByteArray()
        return android.util.Base64.encodeToString(bytes, android.util.Base64.DEFAULT)
    }


    override fun onDestroyView() {
        super.onDestroyView()
        cameraExecutor.shutdown()
        _binding = null
    }
}
