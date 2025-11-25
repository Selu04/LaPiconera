package com.lapiconera.proyecto.ui.productos

import android.app.AlertDialog
import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapiconera.proyecto.data.repository.ProductoRepository
import com.lapiconera.proyecto.data.repository.CategoriaRepository
import com.lapiconera.proyecto.data.repository.TagRepository
import com.lapiconera.proyecto.data.repository.AlergenoRepository
import com.lapiconera.proyecto.data.model.Producto
import com.lapiconera.proyecto.data.model.ProductoRequest
import com.lapiconera.proyecto.data.model.Categoria
import com.lapiconera.proyecto.data.model.Tag
import com.lapiconera.proyecto.data.model.Alergeno
import kotlinx.coroutines.launch

class ProductosViewModel : ViewModel() {

    private val TAG = "ProductosViewModel"
    private val repository = ProductoRepository()
    private val categoriaRepository = CategoriaRepository()
    private val tagRepository = TagRepository()
    private val alergenoRepository = AlergenoRepository()

    private val _productos = MutableLiveData<List<Producto>>()
    val productos: LiveData<List<Producto>> = _productos

    private val _categorias = MutableLiveData<List<Categoria>>()
    val categorias: LiveData<List<Categoria>> = _categorias

    private val _tags = MutableLiveData<List<Tag>>()
    val tags: LiveData<List<Tag>> = _tags

    private val _alergenos = MutableLiveData<List<Alergeno>>()
    val alergenos: LiveData<List<Alergeno>> = _alergenos

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _errorMessage = MutableLiveData<String>()
    val errorMessage: LiveData<String> = _errorMessage

    /**
     * Carga todos los productos
     */
    fun cargarProductos(
        categoria: String? = null,
        alergenos: List<String>? = null,
        tags: List<String>? = null,
        search: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null,
        todos: Boolean? = null
    ) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val result = repository.getProductos(
                    categoria = categoria,
                    alergenos = alergenos,
                    tags = tags,
                    search = search,
                    minPrice = minPrice,
                    maxPrice = maxPrice,
                    todos = todos
                )

                result.onSuccess { lista ->
                    setProductosOrdenados(lista)
                    _errorMessage.postValue("")
                }.onFailure { error ->
                    Log.e(TAG, "Error al cargar productos: ${error.message}", error)
                    _errorMessage.postValue(error.message ?: "Error al cargar productos")
                    _productos.postValue(emptyList())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al cargar productos: ${e.message}", e)
                _errorMessage.postValue(e.message ?: "Error inesperado")
                _productos.postValue(emptyList())
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    /**
     * Crea un nuevo producto
     */
    fun crearProducto(productoRequest: ProductoRequest, onSuccess: (Producto) -> Unit) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val result = repository.crearProducto(productoRequest)

                result.onSuccess { producto ->
                    Log.d(TAG, "Producto creado: ID=${producto.id}")
                    onSuccess(producto)
                    cargarProductos()
                }.onFailure { error ->
                    Log.e(TAG, "Error al crear producto: ${error.message}", error)
                    _errorMessage.postValue(error.message ?: "Error al crear producto")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al crear producto: ${e.message}", e)
                _errorMessage.postValue(e.message ?: "Error inesperado")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    /**
     * Actualiza un producto existente
     */
    fun actualizarProducto(id: String, productoRequest: ProductoRequest, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val result = repository.actualizarProducto(id, productoRequest)

                result.onSuccess { producto ->
                    Log.d(TAG, "Producto actualizado: ID=${producto.id}")
                    onSuccess()
                    cargarProductos()
                }.onFailure { error ->
                    Log.e(TAG, "Error al actualizar producto: ${error.message}", error)
                    _errorMessage.postValue(error.message ?: "Error al actualizar producto")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al actualizar producto: ${e.message}", e)
                _errorMessage.postValue(e.message ?: "Error inesperado")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    /**
     * Actualiza el stock de un producto
     */
    fun actualizarStock(id: String, stockChange: Int, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val result = repository.actualizarStock(id, stockChange)

                result.onSuccess { producto ->
                    Log.d(TAG, "Stock actualizado: ID=${producto.id}, nuevo stock=${producto.stockQuantity}")
                    onSuccess()
                    cargarProductos()
                }.onFailure { error ->
                    Log.e(TAG, "Error al actualizar stock: ${error.message}", error)
                    _errorMessage.postValue(error.message ?: "Error al actualizar stock")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al actualizar stock: ${e.message}", e)
                _errorMessage.postValue(e.message ?: "Error inesperado")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    /**
     * Confirma la eliminación de un producto
     */
    fun confirmarEliminacion(context: Context, producto: Producto, onConfirm: () -> Unit) {
        AlertDialog.Builder(context)
            .setTitle("Confirmar eliminación")
            .setMessage("¿Estás seguro que deseas eliminar ${producto.name}?")
            .setPositiveButton("Sí") { _, _ -> onConfirm() }
            .setNegativeButton("No", null)
            .show()
    }

    /**
     * Elimina un producto
     */
    fun eliminarProducto(id: String, onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            _isLoading.postValue(true)
            try {
                val result = repository.eliminarProducto(id)

                result.onSuccess {
                    Log.d(TAG, "Producto eliminado: ID=$id")
                    onSuccess()
                    cargarProductos()
                }.onFailure { error ->
                    Log.e(TAG, "Error al eliminar producto: ${error.message}", error)
                    _errorMessage.postValue(error.message ?: "Error al eliminar producto")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al eliminar producto: ${e.message}", e)
                _errorMessage.postValue(e.message ?: "Error inesperado")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }

    /**
     * Actualiza un producto en la lista local
     */
    fun actualizarProductoEnLista(productoActualizado: Producto) {
        val listaActual = _productos.value ?: emptyList()
        val nuevaLista = listaActual.map {
            if (it.id == productoActualizado.id) productoActualizado else it
        }.sortedBy { it.name.lowercase() }
        _productos.postValue(nuevaLista)
    }

    /**
     * Ordena y establece la lista de productos
     */
    private fun setProductosOrdenados(productos: List<Producto>) {
        val ordenados = productos.sortedBy { it.name.lowercase() }
        _productos.postValue(ordenados)
    }

    /**
     * Carga las categorías desde la API
     */
    fun cargarCategorias() {
        viewModelScope.launch {
            try {
                val result = categoriaRepository.getCategorias()

                result.onSuccess { categorias ->
                    _categorias.postValue(categorias)
                }.onFailure { error ->
                    Log.e(TAG, "Error al cargar categorías: ${error.message}", error)
                    _categorias.postValue(emptyList())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al cargar categorías: ${e.message}", e)
                _categorias.postValue(emptyList())
            }
        }
    }

    /**
     * Carga los tags desde la API
     */
    fun cargarTags() {
        viewModelScope.launch {
            try {
                val result = tagRepository.getTags()

                result.onSuccess { tags ->
                    Log.d(TAG, "Tags cargados: ${tags.size}")
                    _tags.postValue(tags)
                }.onFailure { error ->
                    Log.e(TAG, "Error al cargar tags: ${error.message}", error)
                    _tags.postValue(emptyList())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al cargar tags: ${e.message}", e)
                _tags.postValue(emptyList())
            }
        }
    }

    /**
     * Carga los alérgenos desde la API
     */
    fun cargarAlergenos() {
        viewModelScope.launch {
            try {
                val result = alergenoRepository.getAlergenos()

                result.onSuccess { alergenos ->
                    Log.d(TAG, "Alérgenos cargados: ${alergenos.size}")
                    _alergenos.postValue(alergenos)
                }.onFailure { error ->
                    Log.e(TAG, "Error al cargar alérgenos: ${error.message}", error)
                    _alergenos.postValue(emptyList())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception al cargar alérgenos: ${e.message}", e)
                _alergenos.postValue(emptyList())
            }
        }
    }

}
