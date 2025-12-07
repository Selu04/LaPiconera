import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'
import { useNotification } from '../context/NotificationContext'
import { getTodosProductos, crearProducto, actualizarProducto, eliminarProducto } from './api/productos'
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from './api/categorias'
import { getTags, crearTag, actualizarTag, eliminarTag } from './api/tags'
import { getAlergenos, crearAlergeno, actualizarAlergeno, eliminarAlergeno } from './api/alergenos'
import { getEmpleados, crearEmpleado, actualizarRol, eliminarEmpleado } from './api/empleados'
import { getUsuarios, actualizarBanUsuario } from './api/usuarios'
async function getSugerencias() {
  const res = await fetch('/api/sugerencias')
  if (!res.ok) throw new Error('Error al obtener sugerencias')
  return res.json()
}
async function actualizarSugerencia(id, status = null, action = null, responseData = null) {
  const res = await fetch('/api/sugerencias', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, action, responseData })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(errorData.error || 'Error al actualizar sugerencia')
  }
  return res.json()
}
async function eliminarSugerencia(id) {
  const res = await fetch('/api/sugerencias', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  if (!res.ok) throw new Error('Error al eliminar sugerencia')
  return res.json()
}
async function getContactos() {
  const res = await fetch('/api/contactos')
  if (!res.ok) throw new Error('Error al obtener contactos')
  return res.json()
}
async function actualizarContacto(id, leido = null, action = null, responseData = null) {
  const res = await fetch('/api/contactos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, leido, action, responseData })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(errorData.error || 'Error al actualizar contacto')
  }
  return res.json()
}
async function eliminarContacto(id) {
  const res = await fetch('/api/contactos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  if (!res.ok) throw new Error('Error al eliminar contacto')
  return res.json()
}
export default function Admin() {
  const router = useRouter()
  const { usuario } = useUser()
  const { showSuccess, showError, showConfirm } = useNotification()
  const [seccionActiva, setSeccionActiva] = useState('productos')
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tags, setTags] = useState([])
  const [alergenos, setAlergenos] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [formProducto, setFormProducto] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    barcode: '',
    allergens: [],
    tags: [],
    stock_quantity: '',
    min_stock: '',
    is_available: true
  })
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [formCategoria, setFormCategoria] = useState({
    id: '',
    name: '',
    description: '',
    icon: '📦'
  })
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [modalAsignacionCategoriaAbierto, setModalAsignacionCategoriaAbierto] = useState(false)
  const [categoriaParaAsignar, setCategoriaParaAsignar] = useState(null)
  const [modalAlergenoAbierto, setModalAlergenoAbierto] = useState(false)
  const [alergenoEditando, setAlergenoEditando] = useState(null)
  const [formAlergeno, setFormAlergeno] = useState({
    name: '',
    icon: '⚠️',
    description: '',
    alimentos_comunes: '',
    tambien_conocido_como: ''
  })
  const [busquedaAlergeno, setBusquedaAlergeno] = useState('')
  const [modalAsignacionAlergenoAbierto, setModalAsignacionAlergenoAbierto] = useState(false)
  const [alergenoParaAsignar, setAlergenoParaAsignar] = useState(null)
  const [modalTagAbierto, setModalTagAbierto] = useState(false)
  const [tagEditando, setTagEditando] = useState(null)
  const [formTag, setFormTag] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [busquedaTag, setBusquedaTag] = useState('')
  const [modalAsignacionTagAbierto, setModalAsignacionTagAbierto] = useState(false)
  const [tagParaAsignar, setTagParaAsignar] = useState(null)
  const [busquedaAsignacionCategoria, setBusquedaAsignacionCategoria] = useState('')
  const [busquedaAsignacionAlergeno, setBusquedaAsignacionAlergeno] = useState('')
  const [busquedaAsignacionTag, setBusquedaAsignacionTag] = useState('')
  const [empleados, setEmpleados] = useState([])
  const [modalEmpleadoAbierto, setModalEmpleadoAbierto] = useState(false)
  const [formEmpleado, setFormEmpleado] = useState({
    email: '',
    name: '',
    password: ''
  })
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [filtroSugerencias, setFiltroSugerencias] = useState('todas') 
  const [filtroArchivadoSugerencias, setFiltroArchivadoSugerencias] = useState('no-archivadas')
  const [busquedaSugerencia, setBusquedaSugerencia] = useState('')
  const [contactos, setContactos] = useState([])
  const [filtroContactos, setFiltroContactos] = useState('todos') 
  const [busquedaContacto, setBusquedaContacto] = useState('')
  const [modalRespuestaSugerenciaAbierto, setModalRespuestaSugerenciaAbierto] = useState(false)
  const [sugerenciaRespondiendo, setSugerenciaRespondiendo] = useState(null)
  const [modalRespuestaContactoAbierto, setModalRespuestaContactoAbierto] = useState(false)
  const [contactoRespondiendo, setContactoRespondiendo] = useState(null)
  const [formRespuesta, setFormRespuesta] = useState({
    subject: '',
    message: ''
  })
  const [subSeccionComunicacion, setSubSeccionComunicacion] = useState('sugerencias')
  const [usuarios, setUsuarios] = useState([])
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [filtroBanUsuario, setFiltroBanUsuario] = useState('todos') 
  const [subSeccionFiltros, setSubSeccionFiltros] = useState('alergenos') 
  useEffect(() => {
    if (!usuario) {
      router.push('/login')
      return
    }
    if (usuario.role !== 'admin' && usuario.role !== 'employee') {
      router.push('/')
      return
    }
    cargarDatos()
  }, [usuario])
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [prodData, catData, tagData, alergData, empData, sugData, contData, usersData] = await Promise.all([
        getTodosProductos(),
        getCategorias(),
        getTags(),
        getAlergenos(),
        getEmpleados(),
        getSugerencias(),
        getContactos(),
        getUsuarios()
      ])
      setProductos(prodData)
      setCategorias(catData)
      setTags(tagData)
      setAlergenos(alergData)
      setEmpleados(empData)
      setSugerencias(sugData)
      setContactos(contData)
      setUsuarios(usersData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.name.toLowerCase().includes(busquedaProducto.toLowerCase())
    const matchCategoria = categoriaFiltro === 'todas' || p.category === categoriaFiltro
    let matchEstado = true
    if (estadoFiltro === 'disponible') {
      matchEstado = p.is_available === true
    } else if (estadoFiltro === 'no_disponible') {
      matchEstado = p.is_available === false
    } else if (estadoFiltro === 'bajo_stock') {
      const threshold = p.min_stock || 10
      matchEstado = p.stock_quantity <= threshold && p.stock_quantity > 0
    } else if (estadoFiltro === 'agotado') {
      matchEstado = p.stock_quantity === 0
    }
    return matchBusqueda && matchCategoria && matchEstado
  })
  const abrirModalProducto = (producto = null) => {
    if (producto) {
      setProductoEditando(producto)
      setFormProducto({
        name: producto.name,
        description: producto.description || '',
        price: producto.price,
        category: producto.category || '',
        image: producto.image || '',
        barcode: producto.barcode || '',
        allergens: producto.allergens || [],
        tags: producto.tags || [],
        stock_quantity: producto.stock_quantity || 0,
        min_stock: producto.min_stock || 0,
        is_available: producto.is_available !== undefined ? producto.is_available : true
      })
    } else {
      setProductoEditando(null)
      setFormProducto({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        barcode: '',
        allergens: [],
        tags: [],
        stock_quantity: '',
        min_stock: '',
        is_available: true
      })
    }
    setModalProductoAbierto(true)
  }
  const cerrarModalProducto = () => {
    setModalProductoAbierto(false)
    setProductoEditando(null)
  }
  const guardarProducto = async (e) => {
    e.preventDefault()
    try {
      const datos = {
        name: formProducto.name,
        description: formProducto.description,
        price: parseFloat(formProducto.price),
        category: formProducto.category,
        image: formProducto.image,
        allergens: formProducto.allergens,
        tags: formProducto.tags,
        stock_quantity: parseInt(formProducto.stock_quantity) || 0,
        min_stock: parseInt(formProducto.min_stock) || 0,
        is_available: formProducto.is_available
      }
      if (productoEditando) {
        await actualizarProducto(productoEditando.id, datos)
        showSuccess('Producto actualizado correctamente')
      } else {
        await crearProducto(datos)
        showSuccess('Producto creado correctamente')
      }
      await cargarDatos()
      cerrarModalProducto()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      showError('Error al guardar el producto')
    }
  }
  const eliminarProductoConfirm = async (id) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Producto',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    if (confirmed) {
      try {
        await eliminarProducto(id)
        await cargarDatos()
        showSuccess('Producto eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        showError('Error al eliminar el producto')
      }
    }
  }
  const toggleAlergeno = (alergeno) => {
    setFormProducto(prev => ({
      ...prev,
      allergens: prev.allergens.includes(alergeno)
        ? prev.allergens.filter(a => a !== alergeno)
        : [...prev.allergens, alergeno]
    }))
  }
  const toggleTag = (tag) => {
    setFormProducto(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }
  const abrirModalCategoria = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria)
      setFormCategoria({
        id: categoria.id,
        name: categoria.name,
        description: categoria.description || '',
        icon: categoria.icon || '📦'
      })
    } else {
      setCategoriaEditando(null)
      setFormCategoria({
        id: '',
        name: '',
        description: '',
        icon: '📦'
      })
    }
    setModalCategoriaAbierto(true)
  }
  const cerrarModalCategoria = () => {
    setModalCategoriaAbierto(false)
    setCategoriaEditando(null)
  }
  const guardarCategoria = async (e) => {
    e.preventDefault()
    try {
      const datos = {
        id: formCategoria.id.toLowerCase().replace(/\s+/g, '_'),
        name: formCategoria.name,
        description: formCategoria.description,
        icon: formCategoria.icon
      }
      if (categoriaEditando) {
        await actualizarCategoria(categoriaEditando.id, datos)
        showSuccess('Categoría actualizada correctamente')
      } else {
        await crearCategoria(datos)
        showSuccess('Categoría creada correctamente')
      }
      await cargarDatos()
      cerrarModalCategoria()
    } catch (error) {
      console.error('Error al guardar categoría:', error)
      showError('Error al guardar la categoría')
    }
  }
  const eliminarCategoriaConfirm = async (id) => {
    const productosAsociados = productos.filter(p => p.category === id)
    if (productosAsociados.length > 0) {
      const mensaje = `No se puede eliminar esta categoría porque tiene ${productosAsociados.length} producto(s) asociado(s)`
      showError(mensaje)
      console.error(mensaje)
      return
    }
    const confirmed = await showConfirm({
      title: 'Eliminar Categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    if (confirmed) {
      try {
        await eliminarCategoria(id)
        await cargarDatos()
        showSuccess('Categoría eliminada correctamente')
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
        showError('Error al eliminar la categoría')
      }
    }
  }
  const categoriasFiltradas = categorias.filter(c => 
    c.name.toLowerCase().includes(busquedaCategoria.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(busquedaCategoria.toLowerCase()))
  )
  const contarProductosPorCategoria = (categoriaId) => {
    return productos.filter(p => p.category === categoriaId).length
  }
  const abrirModalAlergeno = (alergeno = null) => {
    if (alergeno) {
      setAlergenoEditando(alergeno)
      setFormAlergeno({
        name: alergeno.name,
        icon: alergeno.icon,
        description: alergeno.description || '',
        alimentos_comunes: alergeno.alimentos_comunes || '',
        tambien_conocido_como: alergeno.tambien_conocido_como || ''
      })
    } else {
      setAlergenoEditando(null)
      setFormAlergeno({
        name: '',
        icon: '⚠️',
        description: '',
        alimentos_comunes: '',
        tambien_conocido_como: ''
      })
    }
    setModalAlergenoAbierto(true)
  }
  const cerrarModalAlergeno = () => {
    setModalAlergenoAbierto(false)
    setAlergenoEditando(null)
  }
  const guardarAlergeno = async (e) => {
    e.preventDefault()
    try {
      const datos = {
        name: formAlergeno.name,
        icon: formAlergeno.icon,
        description: formAlergeno.description || null,
        alimentos_comunes: formAlergeno.alimentos_comunes || null,
        tambien_conocido_como: formAlergeno.tambien_conocido_como || null
      }
      if (alergenoEditando) {
        await actualizarAlergeno(alergenoEditando.id, datos)
        showSuccess('Alérgeno actualizado correctamente')
      } else {
        await crearAlergeno(datos)
        showSuccess('Alérgeno creado correctamente')
      }
      await cargarDatos()
      cerrarModalAlergeno()
    } catch (error) {
      console.error('Error al guardar alérgeno:', error)
      showError('Error al guardar el alérgeno')
    }
  }
  const eliminarAlergenoConfirm = async (id) => {
    const alergenoObj = alergenos.find(a => a.id === id)
    if (!alergenoObj) return
    const productosAsociados = productos.filter(p => 
      p.allergens && (p.allergens.includes(id) || p.allergens.includes(alergenoObj.name))
    )
    if (productosAsociados.length > 0) {
      const mensaje = `No se puede eliminar este alérgeno porque está asociado a ${productosAsociados.length} producto(s)`
      showError(mensaje)
      console.error(mensaje)
      return
    }
    const confirmed = await showConfirm({
      title: 'Eliminar Alérgeno',
      message: `¿Estás seguro de que deseas eliminar "${alergenoObj.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    if (confirmed) {
      try {
        await eliminarAlergeno(id)
        await cargarDatos()
        showSuccess('Alérgeno eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar alérgeno:', error)
        showError('Error al eliminar el alérgeno')
      }
    }
  }
  const alergenosFiltrados = alergenos.filter(a => 
    a.name.toLowerCase().includes(busquedaAlergeno.toLowerCase())
  )
  const contarProductosPorAlergeno = (alergenoName) => {
    if (!alergenoName) return 0
    const alergenoObj = alergenos.find(a => a.name === alergenoName || a.id === alergenoName)
    if (!alergenoObj) return 0
    const count = productos.filter(p => {
      if (!p.allergens || !Array.isArray(p.allergens)) return false
      return p.allergens.some(a => 
        a && (
          a.toString().toLowerCase().trim() === alergenoObj.name.toLowerCase().trim() ||
          a.toString().toLowerCase().trim() === alergenoObj.id.toLowerCase().trim()
        )
      )
    }).length
    return count
  }
  const abrirModalTag = (tag = null) => {
    if (tag) {
      setTagEditando(tag)
      setFormTag({
        name: tag.name,
        description: tag.description || '',
        color: tag.color || '#3B82F6'
      })
    } else {
      setTagEditando(null)
      setFormTag({
        name: '',
        description: '',
        color: '#3B82F6'
      })
    }
    setModalTagAbierto(true)
  }
  const cerrarModalTag = () => {
    setModalTagAbierto(false)
    setTagEditando(null)
  }
  const guardarTag = async (e) => {
    e.preventDefault()
    try {
      const datos = {
        name: formTag.name,
        description: formTag.description,
        color: formTag.color
      }
      if (tagEditando) {
        await actualizarTag(tagEditando.id, datos)
        showSuccess('Etiqueta actualizada correctamente')
      } else {
        await crearTag(datos)
        showSuccess('Etiqueta creada correctamente')
      }
      await cargarDatos()
      cerrarModalTag()
    } catch (error) {
      console.error('Error al guardar etiqueta:', error)
      showError('Error al guardar la etiqueta')
    }
  }
  const eliminarTagConfirm = async (id) => {
    const tagObj = tags.find(t => t.id === id)
    if (!tagObj) return
    const productosAsociados = productos.filter(p => 
      p.tags && (p.tags.includes(id) || p.tags.includes(tagObj.name))
    )
    if (productosAsociados.length > 0) {
      const mensaje = `No se puede eliminar esta etiqueta porque está asociada a ${productosAsociados.length} producto(s)`
      showError(mensaje)
      console.error(mensaje)
      return
    }
    const confirmed = await showConfirm({
      title: 'Eliminar Etiqueta',
      message: `¿Estás seguro de que deseas eliminar "${tagObj.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    })
    if (confirmed) {
      try {
        await eliminarTag(id)
        await cargarDatos()
        showSuccess('Etiqueta eliminada correctamente')
      } catch (error) {
        console.error('Error al eliminar etiqueta:', error)
        showError('Error al eliminar la etiqueta')
      }
    }
  }
  const tagsFiltrados = tags.filter(t => 
    t.name.toLowerCase().includes(busquedaTag.toLowerCase())
  )
  const contarProductosPorTag = (tagName) => {
    const tagObj = tags.find(t => t.name === tagName || t.id === tagName)
    if (!tagObj) return 0
    return productos.filter(p => 
      p.tags && (p.tags.includes(tagName) || p.tags.includes(tagObj.id) || p.tags.includes(tagObj.name))
    ).length
  }
  const abrirModalAsignacionCategoria = (categoria) => {
    setCategoriaParaAsignar(categoria)
    setModalAsignacionCategoriaAbierto(true)
  }
  const cerrarModalAsignacionCategoria = () => {
    setModalAsignacionCategoriaAbierto(false)
    setCategoriaParaAsignar(null)
    setBusquedaAsignacionCategoria('')
  }
  const abrirModalAsignacionAlergeno = (alergeno) => {
    setAlergenoParaAsignar(alergeno)
    setModalAsignacionAlergenoAbierto(true)
  }
  const cerrarModalAsignacionAlergeno = () => {
    setModalAsignacionAlergenoAbierto(false)
    setAlergenoParaAsignar(null)
    setBusquedaAsignacionAlergeno('')
  }
  const abrirModalAsignacionTag = (tag) => {
    setTagParaAsignar(tag)
    setModalAsignacionTagAbierto(true)
  }
  const cerrarModalAsignacionTag = () => {
    setModalAsignacionTagAbierto(false)
    setTagParaAsignar(null)
    setBusquedaAsignacionTag('')
  }
  const toggleCategoriaEnProducto = async (productoId, categoriaId) => {
    try {
      const producto = productos.find(p => p.id === productoId)
      if (!producto) return
      const nuevaCategoria = producto.category === categoriaId ? null : categoriaId
      const { error } = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productoId,
          category: nuevaCategoria
        })
      }).then(r => r.json())
      if (error) throw new Error(error)
      setProductos(productos.map(p => 
        p.id === productoId ? { ...p, category: nuevaCategoria } : p
      ))
      showSuccess(nuevaCategoria ? 'Categoría asignada' : 'Categoría quitada')
    } catch (error) {
      console.error('Error al actualizar categoría:', error)
      showError('Error al actualizar la categoría')
    }
  }

  const quitarTodosProductosCategoria = async (categoriaId) => {
    const productosAsociados = productos.filter(p => p.category === categoriaId)
    
    if (productosAsociados.length === 0) {
      showWarning('No hay productos asociados a esta categoría')
      return
    }

    const confirmed = await showConfirm({
      title: 'Quitar todos los productos',
      message: `¿Estás seguro de que deseas quitar la categoría de ${productosAsociados.length} producto(s)? Los productos no se eliminarán, solo se quitará la categoría.`,
      confirmText: 'Quitar categoría',
      cancelText: 'Cancelar',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const promesas = productosAsociados.map(producto => 
        fetch('/api/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: producto.id,
            category: null
          })
        }).then(r => r.json())
      )

      await Promise.all(promesas)

      setProductos(productos.map(p => 
        p.category === categoriaId ? { ...p, category: null } : p
      ))

      showSuccess(`Categoría quitada de ${productosAsociados.length} producto(s)`)
    } catch (error) {
      console.error('Error al quitar categoría de productos:', error)
      showError('Error al quitar la categoría de los productos')
    }
  }
  const toggleAlergenoEnProducto = async (productoId, alergenoId) => {
    try {
      const producto = productos.find(p => p.id === productoId)
      if (!producto) return
      const allergens = producto.allergens || []
      const alergenoObj = alergenos.find(a => a.id === alergenoId || a.name === alergenoId)
      const tieneAlergeno = allergens.some(a => 
        a === alergenoId || 
        a === alergenoObj?.id || 
        a === alergenoObj?.name
      )
      let nuevosAlergenos
      if (tieneAlergeno) {
        nuevosAlergenos = allergens.filter(a => 
          a !== alergenoId && 
          a !== alergenoObj?.id && 
          a !== alergenoObj?.name
        )
      } else {
        nuevosAlergenos = [...allergens, alergenoObj.id]
      }
      const { error } = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productoId,
          allergens: nuevosAlergenos
        })
      }).then(r => r.json())
      if (error) throw new Error(error)
      setProductos(productos.map(p => 
        p.id === productoId ? { ...p, allergens: nuevosAlergenos } : p
      ))
      showSuccess(tieneAlergeno ? 'Alérgeno quitado' : 'Alérgeno añadido')
    } catch (error) {
      console.error('Error al actualizar alérgenos:', error)
      showError('Error al actualizar los alérgenos')
    }
  }
  const toggleTagEnProducto = async (productoId, tagId) => {
    try {
      const producto = productos.find(p => p.id === productoId)
      if (!producto) return
      const productTags = producto.tags || []
      const tagObj = tags.find(t => t.id === tagId || t.name === tagId)
      const tieneTag = productTags.some(t => 
        t === tagId || 
        t === tagObj?.id || 
        t === tagObj?.name
      )
      let nuevosTags
      if (tieneTag) {
        nuevosTags = productTags.filter(t => 
          t !== tagId && 
          t !== tagObj?.id && 
          t !== tagObj?.name
        )
      } else {
        nuevosTags = [...productTags, tagObj.id]
      }
      const { error } = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productoId,
          tags: nuevosTags
        })
      }).then(r => r.json())
      if (error) throw new Error(error)
      setProductos(productos.map(p => 
        p.id === productoId ? { ...p, tags: nuevosTags } : p
      ))
      showSuccess(tieneTag ? 'Tag quitada' : 'Tag añadida')
    } catch (error) {
      console.error('Error al actualizar tags:', error)
      showError('Error al actualizar las tags')
    }
  }

  const quitarTodosProductosAlergeno = async (alergenoId) => {
    const alergenoObj = alergenos.find(a => a.id === alergenoId)
    const productosAsociados = productos.filter(p => 
      p.allergens && p.allergens.some(a => 
        a === alergenoId || 
        a === alergenoObj?.id || 
        a === alergenoObj?.name
      )
    )
    
    if (productosAsociados.length === 0) {
      showWarning('No hay productos asociados a este alérgeno')
      return
    }

    const confirmed = await showConfirm({
      title: 'Quitar alérgeno de todos los productos',
      message: `¿Estás seguro de que deseas quitar el alérgeno "${alergenoObj?.name}" de ${productosAsociados.length} producto(s)?`,
      confirmText: 'Quitar alérgeno',
      cancelText: 'Cancelar',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const promesas = productosAsociados.map(producto => {
        const nuevosAlergenos = (producto.allergens || []).filter(a => 
          a !== alergenoId && 
          a !== alergenoObj?.id && 
          a !== alergenoObj?.name
        )
        return fetch('/api/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: producto.id,
            allergens: nuevosAlergenos
          })
        }).then(r => r.json())
      })

      await Promise.all(promesas)

      setProductos(productos.map(p => {
        if (p.allergens && p.allergens.some(a => 
          a === alergenoId || 
          a === alergenoObj?.id || 
          a === alergenoObj?.name
        )) {
          return {
            ...p,
            allergens: (p.allergens || []).filter(a => 
              a !== alergenoId && 
              a !== alergenoObj?.id && 
              a !== alergenoObj?.name
            )
          }
        }
        return p
      }))

      showSuccess(`Alérgeno quitado de ${productosAsociados.length} producto(s)`)
    } catch (error) {
      console.error('Error al quitar alérgeno de productos:', error)
      showError('Error al quitar el alérgeno de los productos')
    }
  }

  const quitarTodosProductosTag = async (tagId) => {
    const tagObj = tags.find(t => t.id === tagId)
    const productosAsociados = productos.filter(p => 
      p.tags && p.tags.some(t => 
        t === tagId || 
        t === tagObj?.id || 
        t === tagObj?.name
      )
    )
    
    if (productosAsociados.length === 0) {
      showWarning('No hay productos asociados a esta etiqueta')
      return
    }

    const confirmed = await showConfirm({
      title: 'Quitar etiqueta de todos los productos',
      message: `¿Estás seguro de que deseas quitar la etiqueta "${tagObj?.name}" de ${productosAsociados.length} producto(s)?`,
      confirmText: 'Quitar etiqueta',
      cancelText: 'Cancelar',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const promesas = productosAsociados.map(producto => {
        const nuevosTags = (producto.tags || []).filter(t => 
          t !== tagId && 
          t !== tagObj?.id && 
          t !== tagObj?.name
        )
        return fetch('/api/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: producto.id,
            tags: nuevosTags
          })
        }).then(r => r.json())
      })

      await Promise.all(promesas)

      setProductos(productos.map(p => {
        if (p.tags && p.tags.some(t => 
          t === tagId || 
          t === tagObj?.id || 
          t === tagObj?.name
        )) {
          return {
            ...p,
            tags: (p.tags || []).filter(t => 
              t !== tagId && 
              t !== tagObj?.id && 
              t !== tagObj?.name
            )
          }
        }
        return p
      }))

      showSuccess(`Etiqueta quitada de ${productosAsociados.length} producto(s)`)
    } catch (error) {
      console.error('Error al quitar etiqueta de productos:', error)
      showError('Error al quitar la etiqueta de los productos')
    }
  }
  const abrirModalEmpleado = () => {
    setFormEmpleado({ email: '', name: '', password: '' })
    setModalEmpleadoAbierto(true)
  }
  const cerrarModalEmpleado = () => {
    setModalEmpleadoAbierto(false)
    setFormEmpleado({ email: '', name: '', password: '' })
  }
  const handleSubmitEmpleado = async (e) => {
    e.preventDefault()
    try {
      await crearEmpleado(formEmpleado.email, formEmpleado.password, formEmpleado.name)
      await cargarDatos()
      cerrarModalEmpleado()
      showSuccess('Empleado agregado exitosamente')
    } catch (error) {
      console.error('Error al crear empleado:', error)
      showError(error.message || 'Error al agregar el empleado')
    }
  }
  const reactivarEmpleado = async (id, nombre) => {
    const confirmar = await showConfirm(
      `¿Reactivar a ${nombre}?`,
      'Este empleado volverá a tener acceso al sistema'
    )
    if (confirmar) {
      try {
        const empleado = empleados.find(e => e.id === id)
        await crearEmpleado(empleado.email, '', '')
        await cargarDatos()
        showSuccess('Empleado reactivado exitosamente')
      } catch (error) {
        console.error('Error al reactivar empleado:', error)
        showError(error.message || 'Error al reactivar el empleado')
      }
    }
  }
  const promoverEmpleado = async (id) => {
    const confirmar = await showConfirm(
      '¿Promover a administrador?',
      'Este empleado tendrá acceso completo al panel de administración'
    )
    if (confirmar) {
      try {
        await actualizarRol(id, 'admin')
        await cargarDatos()
        showSuccess('Empleado promovido a administrador')
      } catch (error) {
        console.error('Error al promover empleado:', error)
        showError(error.message || 'Error al promover el empleado')
      }
    }
  }
  const degradarAdmin = async (id) => {
    const adminsActivos = empleados.filter(e => e.role === 'admin' && e.is_active !== false)
    if (adminsActivos.length <= 1) {
      showError('No se puede degradar al último administrador activo')
      return
    }
    const confirmar = await showConfirm(
      '¿Degradar a empleado?',
      'Este administrador perderá algunos privilegios'
    )
    if (confirmar) {
      try {
        await actualizarRol(id, 'employee')
        await cargarDatos()
        showSuccess('Administrador degradado a empleado')
      } catch (error) {
        console.error('Error al degradar administrador:', error)
        showError(error.message || 'Error al degradar el administrador')
      }
    }
  }
  const eliminarEmpleadoConfirm = async (id, nombre) => {
    const empleado = empleados.find(e => e.id === id)
    if (empleado && empleado.role === 'admin' && empleado.is_active !== false) {
      const adminsActivos = empleados.filter(e => e.role === 'admin' && e.is_active !== false)
      if (adminsActivos.length <= 1) {
        showError('No se puede desactivar al último administrador activo')
        return
      }
    }
    const confirmar = await showConfirm(
      `¿Desactivar a ${nombre}?`,
      'Este empleado no podrá acceder al sistema pero podrá ser reactivado después'
    )
    if (confirmar) {
      try {
        await eliminarEmpleado(id)
        await cargarDatos()
        showSuccess('Empleado desactivado exitosamente')
      } catch (error) {
        console.error('Error al desactivar empleado:', error)
        showError(error.message || 'Error al desactivar el empleado')
      }
    }
  }
  const cambiarNivelBan = async (userId, nuevoNivel) => {
    try {
      await actualizarBanUsuario(userId, nuevoNivel)
      await cargarDatos()
      const niveles = { 0: 'sin restricciones', 1: 'sin pedidos', 2: 'sin pedidos ni contacto' }
      showSuccess(`Nivel de ban actualizado a: ${niveles[nuevoNivel]}`)
    } catch (error) {
      console.error('Error al cambiar nivel de ban:', error)
      showError(error.message || 'Error al actualizar el nivel de ban')
    }
  }
  const empleadosFiltrados = empleados.filter(e => 
    e.name.toLowerCase().includes(busquedaEmpleado.toLowerCase()) ||
    e.email.toLowerCase().includes(busquedaEmpleado.toLowerCase())
  )
  const empleadosActivos = empleadosFiltrados.filter(e => e.is_active !== false)
  const empleadosInactivos = empleadosFiltrados.filter(e => e.is_active === false)
  const usuariosFiltrados = usuarios.filter(user => {
    const matchBusqueda = user.email.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(busquedaUsuario.toLowerCase()))
    const matchBan = filtroBanUsuario === 'todos' || user.ban === parseInt(filtroBanUsuario)
    return matchBusqueda && matchBan
  })
  const toggleLikeSugerencia = async (id) => {
    try {
      await actualizarSugerencia(id, null, 'toggle_like')
      await cargarDatos()
      showSuccess('Estado actualizado')
    } catch (error) {
      console.error('Error al actualizar like:', error)
      showError('Error al actualizar el estado')
    }
  }

  const toggleArchivarSugerencia = async (id, archivarActual) => {
    try {
      await actualizarSugerencia(id, null, 'toggle_archived')
      await cargarDatos()
      showSuccess(archivarActual ? 'Sugerencia desarchivada' : 'Sugerencia archivada')
    } catch (error) {
      console.error('Error al archivar/desarchivar:', error)
      showError('Error al actualizar el estado')
    }
  }
  const cambiarEstadoSugerencia = async (id, status) => {
    try {
      await actualizarSugerencia(id, status)
      await cargarDatos()
      showSuccess('Estado actualizado')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      showError('Error al actualizar el estado')
    }
  }
  const abrirModalRespuestaSugerencia = (sugerencia) => {
    setSugerenciaRespondiendo(sugerencia)
    setFormRespuesta({
      subject: `Re: Sugerencia de producto - ${sugerencia.product_name}`,
      message: `Estimado/a ${sugerencia.user_name},\n\nGracias por tu sugerencia sobre "${sugerencia.product_name}".\n\n`
    })
    setModalRespuestaSugerenciaAbierto(true)
  }
  const cerrarModalRespuestaSugerencia = () => {
    setModalRespuestaSugerenciaAbierto(false)
    setSugerenciaRespondiendo(null)
    setFormRespuesta({ subject: '', message: '' })
  }
  const enviarRespuestaSugerencia = async () => {
    if (!formRespuesta.subject.trim() || !formRespuesta.message.trim()) {
      showError('Por favor completa todos los campos')
      return
    }
    try {
      const emailjs = (await import('@emailjs/browser')).default
      await emailjs.send(
        'service_u84p3a5',
        'response',
        {
          to_email: sugerenciaRespondiendo.user_email,
          from_name: 'La Piconera',
          reply_to: 'noreply@tiendalapiconera.com',
          subject: formRespuesta.subject,
          message: formRespuesta.message
        },
        'kJFppQCsbhYLuns4C'
      )
      await actualizarSugerencia(sugerenciaRespondiendo.id, null, 'respond', formRespuesta)
      await cargarDatos()
      showSuccess('Respuesta enviada exitosamente')
      cerrarModalRespuestaSugerencia()
    } catch (error) {
      console.error('Error al enviar respuesta:', error)
      showError('Error al enviar la respuesta: ' + error.message)
    }
  }
  const eliminarSugerenciaConfirm = async (id, nombre) => {
    const confirmar = await showConfirm(
      '¿Eliminar sugerencia?',
      `¿Estás seguro de que deseas eliminar la sugerencia de ${nombre}?`
    )
    if (confirmar) {
      try {
        await eliminarSugerencia(id)
        await cargarDatos()
        showSuccess('Sugerencia eliminada exitosamente')
      } catch (error) {
        console.error('Error al eliminar sugerencia:', error)
        showError('Error al eliminar la sugerencia')
      }
    }
  }
  let sugerenciasFiltradas = sugerencias.filter(s =>
    s.user_name?.toLowerCase().includes(busquedaSugerencia.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(busquedaSugerencia.toLowerCase()) ||
    s.product_name?.toLowerCase().includes(busquedaSugerencia.toLowerCase()) ||
    s.description?.toLowerCase().includes(busquedaSugerencia.toLowerCase()) ||
    (busquedaSugerencia.toLowerCase() === 'liked' && s.liked) ||
    (busquedaSugerencia.toLowerCase() === 'like' && s.liked)
  )
  if (filtroSugerencias !== 'todas') {
    sugerenciasFiltradas = sugerenciasFiltradas.filter(s => s.status === filtroSugerencias)
  }
  if (filtroArchivadoSugerencias === 'archivadas') {
    sugerenciasFiltradas = sugerenciasFiltradas.filter(s => s.archived === true)
  } else if (filtroArchivadoSugerencias === 'no-archivadas') {
    sugerenciasFiltradas = sugerenciasFiltradas.filter(s => !s.archived)
  }
  const toggleLikeContacto = async (id) => {
    try {
      await actualizarContacto(id, null, 'toggle_like')
      await cargarDatos()
      showSuccess('Estado actualizado')
    } catch (error) {
      console.error('Error al actualizar like:', error)
      showError('Error al actualizar el estado')
    }
  }
  const toggleLeidoContacto = async (id, leidoActual) => {
    try {
      await actualizarContacto(id, !leidoActual)
      await cargarDatos()
      showSuccess(leidoActual ? 'Marcado como no leído' : 'Marcado como leído')
    } catch (error) {
      console.error('Error al actualizar contacto:', error)
      showError('Error al actualizar el estado')
    }
  }
  const abrirModalRespuestaContacto = (contacto) => {
    setContactoRespondiendo(contacto)
    setFormRespuesta({
      subject: `Re: ${contacto.asunto}`,
      message: `Estimado/a ${contacto.nombre},\n\nGracias por contactarnos.\n\n`
    })
    setModalRespuestaContactoAbierto(true)
  }
  const cerrarModalRespuestaContacto = () => {
    setModalRespuestaContactoAbierto(false)
    setContactoRespondiendo(null)
    setFormRespuesta({ subject: '', message: '' })
  }
  const enviarRespuestaContacto = async () => {
    if (!formRespuesta.subject.trim() || !formRespuesta.message.trim()) {
      showError('Por favor completa todos los campos')
      return
    }
    try {
      const emailjs = (await import('@emailjs/browser')).default
      await emailjs.send(
        'service_u84p3a5',
        'response',
        {
          to_email: contactoRespondiendo.email,
          from_name: 'La Piconera',
          reply_to: 'noreply@tiendalapiconera.com',
          subject: formRespuesta.subject,
          message: formRespuesta.message
        },
        'kJFppQCsbhYLuns4C'
      )
      await actualizarContacto(contactoRespondiendo.id, null, 'respond', formRespuesta)
      await cargarDatos()
      showSuccess('Respuesta enviada exitosamente')
      cerrarModalRespuestaContacto()
    } catch (error) {
      console.error('Error al enviar respuesta:', error)
      showError('Error al enviar la respuesta: ' + error.message)
    }
  }
  const eliminarContactoConfirm = async (id, nombre) => {
    const confirmar = await showConfirm(
      '¿Eliminar contacto?',
      `¿Estás seguro de que deseas eliminar el mensaje de ${nombre}?`
    )
    if (confirmar) {
      try {
        await eliminarContacto(id)
        await cargarDatos()
        showSuccess('Contacto eliminado exitosamente')
      } catch (error) {
        console.error('Error al eliminar contacto:', error)
        showError('Error al eliminar el contacto')
      }
    }
  }
  let contactosFiltrados = contactos.filter(c =>
    c.nombre?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
    c.email?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
    c.asunto?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
    c.mensaje?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
    (busquedaContacto.toLowerCase() === 'liked' && c.liked) ||
    (busquedaContacto.toLowerCase() === 'like' && c.liked)
  )
  if (filtroContactos === 'leidos') {
    contactosFiltrados = contactosFiltrados.filter(c => c.leido)
  } else if (filtroContactos === 'no_leidos') {
    contactosFiltrados = contactosFiltrados.filter(c => !c.leido)
  }
  const stats = {
    totalProductos: productos.length,
    stockBajo: productos.filter(p => p.stock > 0 && p.stock <= 10).length,
    totalCategorias: categorias.length,
    totalAlergenos: alergenos.length
  }
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </>
    )
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <nav className="flex justify-start md:justify-center gap-1 overflow-x-auto pb-px scrollbar-hide">
              {[
                { id: 'productos', label: 'Productos', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
                { id: 'categorias', label: 'Categorías', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
                { id: 'filtros', label: 'Filtros', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> },
                { id: 'empleados', label: 'Empleados', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                { id: 'usuarios', label: 'Usuarios', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                { id: 'comunicacion', label: 'Comunicación', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> }
              ].map(seccion => (
                <button
                  key={seccion.id}
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 font-medium border-b-2 transition whitespace-nowrap text-xs md:text-base flex-shrink-0 ${
                    seccionActiva === seccion.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="hidden sm:block">{seccion.icon}</span>
                  <span>{seccion.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {seccionActiva === 'productos' && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Productos</h2>
                  <p className="text-sm md:text-base text-gray-600">Administra el catálogo de productos del supermercado</p>
                </div>
                <button
                  onClick={() => abrirModalProducto()}
                  className="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Nuevo Producto</span>
                  <span className="sm:hidden">Nuevo</span>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalProductos}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-2xl font-bold text-green-600">{productos.filter(p => p.stock_quantity > 0).length}</p>
                  <p className="text-xs text-gray-600">En Stock</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-2xl font-bold text-red-600">{productos.filter(p => p.stock_quantity === 0).length}</p>
                  <p className="text-xs text-gray-600">Agotados</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-yellow-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />                  </svg>
                  <p className="text-2xl font-bold text-orange-600">{productos.filter(p => p.stock_quantity < p.min_stock).length}</p>
                  <p className="text-xs text-gray-600">Stock Bajo</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-2xl font-bold text-orange-600">{productos.filter(p => p.allergens.length > 0).length}</p>
                  <p className="text-xs text-gray-600">Con Alérjenos</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">Filtros</h3>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <div className="relative flex-1 md:flex-[2]">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                    <option value="bajo_stock">Bajo stock</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Productos ({productosFiltrados.length})</h3>
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600">No se encontraron productos</p>
                  </div>
                ) : (
                  productosFiltrados.map(producto => (
                    <div key={producto.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        {producto.image ? (
                          <img
                            src={producto.image}
                            alt={producto.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{producto.name}</h4>
                          {!producto.is_available && (
                            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                              No disponible
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1 md:line-clamp-2">{producto.description}</p>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            producto.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
                            producto.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {producto.stock_quantity > 0 ? `${producto.stock_quantity} uds` : 'Agotado'}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-blue-600 whitespace-nowrap">€{producto.price?.toFixed(2)}</span>
                          {producto.category && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {producto.category}
                            </span>
                          )}
                        </div>
                        {producto.allergens && producto.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {producto.allergens.map(alergenoIdOrName => {
                              const alergenoObj = alergenos.find(a => a.id === alergenoIdOrName || a.name === alergenoIdOrName)
                              return alergenoObj ? (
                                <span key={alergenoIdOrName} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  {alergenoObj.icon} {alergenoObj.name}
                                </span>
                              ) : (
                                <span key={alergenoIdOrName} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  {alergenoIdOrName}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {producto.tags && producto.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {producto.tags.map(tagIdOrName => {
                              const tagObj = tags.find(t => t.id === tagIdOrName || t.name === tagIdOrName)
                              return tagObj ? (
                                <span 
                                  key={tagIdOrName} 
                                  className="text-xs px-2 py-1 rounded"
                                  style={{ 
                                    backgroundColor: tagObj.color ? `${tagObj.color}20` : '#E5E7EB',
                                    color: tagObj.color || '#374151'
                                  }}
                                >
                                  {tagObj.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex sm:flex-col gap-2 self-start sm:self-center">
                        <button
                          onClick={() => router.push(`/producto/${producto.id}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Ver producto"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => abrirModalProducto(producto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => eliminarProductoConfirm(producto.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {seccionActiva === 'categorias' && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Categorías</h2>
                  <p className="text-sm md:text-base text-gray-600">Administra las categorías de productos</p>
                </div>
                <button
                  onClick={() => abrirModalCategoria()}
                  className="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Nueva Categoría</span>
                  <span className="sm:hidden">Nueva</span>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-2xl font-bold text-blue-600">{categorias.length}</p>
                  <p className="text-xs text-gray-600">Total Categorías</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-2xl font-bold text-green-600">{productos.length}</p>
                  <p className="text-xs text-gray-600">Total Productos</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-2xl font-bold text-purple-600">
                    {categorias.length > 0 ? Math.round(productos.length / categorias.length) : 0}
                  </p>
                  <p className="text-xs text-gray-600">Productos/Categoría</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-6">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={busquedaCategoria}
                    onChange={(e) => setBusquedaCategoria(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Categorías ({categoriasFiltradas.length})</h3>
                {categoriasFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p>No se encontraron categorías</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoriasFiltradas.map(categoria => (
                      <div 
                        key={categoria.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => abrirModalAsignacionCategoria(categoria)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{categoria.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-800">{categoria.name}</h4>
                              <p className="text-xs text-gray-500">ID: {categoria.id}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); abrirModalCategoria(categoria); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); eliminarCategoriaConfirm(categoria.id); }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {categoria.description && (
                          <p className="text-sm text-gray-600 mb-3">{categoria.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="font-semibold">{contarProductosPorCategoria(categoria.id)}</span> productos
                          </div>
                          {contarProductosPorCategoria(categoria.id) > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activa</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {seccionActiva === 'filtros' && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Filtros</h2>
                  <p className="text-sm md:text-base text-gray-600">Administra alérgenos y etiquetas</p>
                </div>
                <button
                  onClick={() => subSeccionFiltros === 'alergenos' ? abrirModalAlergeno() : abrirModalTag()}
                  className="bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">
                    {subSeccionFiltros === 'alergenos' ? 'Nuevo Alérgeno' : 'Nueva Etiqueta'}
                  </span>
                  <span className="sm:hidden">Nuevo</span>
                </button>
              </div>
              <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setSubSeccionFiltros('alergenos')}
                  className={`px-3 md:px-4 py-2 font-semibold transition border-b-2 whitespace-nowrap text-sm md:text-base ${
                    subSeccionFiltros === 'alergenos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Alérgenos ({alergenos.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setSubSeccionFiltros('tags')}
                  className={`px-3 md:px-4 py-2 font-semibold transition border-b-2 whitespace-nowrap text-sm md:text-base ${
                    subSeccionFiltros === 'tags'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Etiquetas ({tags.length})</span>
                  </div>
                </button>
              </div>
              {subSeccionFiltros === 'alergenos' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-2xl font-bold text-red-600">{alergenos.length}</p>
                      <p className="text-xs text-gray-600">Total Alérgenos</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-2xl font-bold text-orange-600">
                        {productos.filter(p => p.allergens && p.allergens.length > 0).length}
                      </p>
                      <p className="text-xs text-gray-600">Productos con Alérgenos</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-yellow-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-2xl font-bold text-yellow-600">
                        {alergenos.length > 0 
                          ? Math.round(productos.filter(p => p.allergens && p.allergens.length > 0).length / alergenos.length * 10) / 10
                          : 0}
                      </p>
                      <p className="text-xs text-gray-600">Uso Promedio</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-6">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Buscar alérgeno..."
                        value={busquedaAlergeno}
                        onChange={(e) => setBusquedaAlergeno(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Alérgenos ({alergenosFiltrados.length})</h3>
                    {alergenosFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>No se encontraron alérgenos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alergenosFiltrados.map(alergeno => {
                          const productosConAlergeno = contarProductosPorAlergeno(alergeno.name)
                          return (
                            <div 
                              key={alergeno.id} 
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                              onClick={() => abrirModalAsignacionAlergeno(alergeno)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">{alergeno.icon}</span>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{alergeno.name}</h4>
                                    <p className="text-xs text-gray-500">
                                      {productosConAlergeno} producto{productosConAlergeno !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); abrirModalAlergeno(alergeno); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Editar"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); eliminarAlergenoConfirm(alergeno.id); }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Eliminar"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              {productosConAlergeno > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-xs text-gray-600">
                                      Usado en {productosConAlergeno} producto{productosConAlergeno !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
              {subSeccionFiltros === 'tags' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-2xl font-bold text-blue-600">{tags.length}</p>
                      <p className="text-xs text-gray-600">Total Etiquetas</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-2xl font-bold text-green-600">
                        {productos.filter(p => p.tags && p.tags.length > 0).length}
                      </p>
                      <p className="text-xs text-gray-600">Productos con Etiquetas</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-2xl font-bold text-purple-600">
                        {tags.length > 0 
                          ? Math.round(productos.filter(p => p.tags && p.tags.length > 0).length / tags.length * 10) / 10
                          : 0}
                      </p>
                      <p className="text-xs text-gray-600">Uso Promedio</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-6">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Buscar etiqueta..."
                        value={busquedaTag}
                        onChange={(e) => setBusquedaTag(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Etiquetas ({tagsFiltrados.length})</h3>
                    {tagsFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p>No se encontraron etiquetas</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tagsFiltrados.map(tag => {
                          const productosConTag = contarProductosPorTag(tag.name)
                          return (
                            <div 
                              key={tag.id} 
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                              onClick={() => abrirModalAsignacionTag(tag)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: tag.color + '20' }}
                                  >
                                    <svg className="w-5 h-5" style={{ color: tag.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{tag.name}</h4>
                                    <p className="text-xs text-gray-500">
                                      {productosConTag} producto{productosConTag !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); abrirModalTag(tag); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Editar"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); eliminarTagConfirm(tag.id); }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Eliminar"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-500">Color:</span>
                                <div 
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: tag.color }}
                                  title={tag.color}
                                ></div>
                                <span className="text-xs text-gray-500 font-mono">{tag.color}</span>
                              </div>
                              {productosConTag > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-xs text-gray-600">
                                      Usado en {productosConTag} producto{productosConTag !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {seccionActiva === 'empleados' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Empleados</h2>
                    <p className="text-sm md:text-base text-gray-600">Administra el equipo de trabajo</p>
                  </div>
                  <button
                    onClick={abrirModalEmpleado}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Empleado</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{empleados.filter(e => e.is_active !== false).length}</p>
                        <p className="text-xs text-gray-600">Empleados Activos</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{empleados.filter(e => e.role === 'admin' && e.is_active !== false).length}</p>
                        <p className="text-xs text-gray-600">Administradores</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{empleados.filter(e => e.role === 'employee' && e.is_active !== false).length}</p>
                        <p className="text-xs text-gray-600">Empleados</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o email..."
                      value={busquedaEmpleado}
                      onChange={(e) => setBusquedaEmpleado(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Empleados Activos ({empleadosActivos.length})</h3>
                    {empleadosActivos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <p>No hay empleados activos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {empleadosActivos.map(empleado => (
                          <div key={empleado.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  empleado.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                                }`}>
                                  <span className="text-2xl">
                                    {empleado.role === 'admin' ? '👑' : '👤'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-800 truncate">{empleado.name}</h4>
                                  <p className="text-xs text-gray-500 truncate">{empleado.email}</p>
                                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                    empleado.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {empleado.role === 'admin' ? 'Administrador' : 'Empleado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                              {empleado.role === 'employee' ? (
                                <button
                                  onClick={() => promoverEmpleado(empleado.id)}
                                  className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-1"
                                  title="Promover a administrador"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                  <span>Promover</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => degradarAdmin(empleado.id)}
                                  className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1"
                                  title="Degradar a empleado"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                  <span>Degradar</span>
                                </button>
                              )}
                              <button
                                onClick={() => eliminarEmpleadoConfirm(empleado.id, empleado.name)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Desactivar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {empleadosInactivos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-4">Ex-Empleados ({empleadosInactivos.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {empleadosInactivos.map(empleado => (
                          <div key={empleado.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4 opacity-75">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  empleado.previous_role === 'admin' ? 'bg-purple-100 opacity-50' : 'bg-gray-200'
                                }`}>
                                  <span className="text-2xl opacity-50">
                                    {empleado.previous_role === 'admin' ? '👑' : '👤'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-600 truncate">{empleado.name}</h4>
                                  <p className="text-xs text-gray-500 truncate">{empleado.email}</p>
                                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                    empleado.previous_role === 'admin'
                                      ? 'bg-purple-100 text-purple-600'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {empleado.previous_role === 'admin' ? 'Ex-Admin' : 'Ex-Empleado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => reactivarEmpleado(empleado.id, empleado.name)}
                              className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-1"
                              title="Reactivar empleado"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Reactivar {empleado.previous_role === 'admin' ? 'como Admin' : 'como Empleado'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {seccionActiva === 'usuarios' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                  <p className="text-gray-600 text-sm mt-1">Administra los niveles de ban de los usuarios</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Usuarios</p>
                      <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sin Restricciones</p>
                      <p className="text-2xl font-bold text-green-600">{usuarios.filter(u => u.ban === 0 || !u.ban).length}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Con Restricciones</p>
                      <p className="text-2xl font-bold text-red-600">{usuarios.filter(u => u.ban === 1 || u.ban === 2).length}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={busquedaUsuario}
                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <select
                      value={filtroBanUsuario}
                      onChange={(e) => setFiltroBanUsuario(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="todos">Todos los niveles</option>
                      <option value="0">Sin restricciones (0)</option>
                      <option value="1">Sin pedidos (1)</option>
                      <option value="2">Sin pedidos ni contacto (2)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    Usuarios ({usuariosFiltrados.length})
                  </h3>
                  {usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p>No se encontraron usuarios</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {usuariosFiltrados.map(user => {
                        const banLevel = user.ban || 0
                        const banInfo = {
                          0: { label: 'Sin restricciones', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
                          1: { label: 'Sin pedidos', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
                          2: { label: 'Sin pedidos ni contacto', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
                        }
                        const info = banInfo[banLevel]
                        return (
                          <div key={user.id} className={`border ${info.borderColor} ${info.bgColor} rounded-lg p-4`}>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="bg-gray-200 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{user.name || 'Sin nombre'}</h4>
                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${info.bgColor} ${info.textColor} border ${info.borderColor}`}>
                                        Nivel {banLevel}: {info.label}
                                      </span>
                                      {user.role && (
                                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                          {user.role === 'admin' ? 'Admin' : user.role === 'employee' ? 'Empleado' : 'Cliente'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 lg:w-48">
                                <p className="text-xs font-medium text-gray-600 mb-1">Cambiar nivel de ban:</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => cambiarNivelBan(user.id, 0)}
                                    disabled={banLevel === 0}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition ${
                                      banLevel === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                    title="Sin restricciones"
                                  >
                                    0
                                  </button>
                                  <button
                                    onClick={() => cambiarNivelBan(user.id, 1)}
                                    disabled={banLevel === 1}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition ${
                                      banLevel === 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    }`}
                                    title="Sin pedidos"
                                  >
                                    1
                                  </button>
                                  <button
                                    onClick={() => cambiarNivelBan(user.id, 2)}
                                    disabled={banLevel === 2}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition ${
                                      banLevel === 2
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                    title="Sin pedidos ni contacto"
                                  >
                                    2
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {seccionActiva === 'comunicacion' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Comunicación con Clientes</h2>
              </div>
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    <button
                      onClick={() => setSubSeccionComunicacion('sugerencias')}
                      className={`px-4 md:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap text-sm md:text-base ${
                        subSeccionComunicacion === 'sugerencias'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      💡 Sugerencias de Productos
                    </button>
                    <button
                      onClick={() => setSubSeccionComunicacion('contactos')}
                      className={`px-4 md:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap text-sm md:text-base ${
                        subSeccionComunicacion === 'contactos'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      📧 Mensajes de Contacto
                    </button>
                  </nav>
                </div>
                {subSeccionComunicacion === 'sugerencias' && (
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          placeholder="Buscar por nombre, email, producto o descripción..."
                          value={busquedaSugerencia}
                          onChange={(e) => setBusquedaSugerencia(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={filtroSugerencias}
                          onChange={(e) => setFiltroSugerencias(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="todas">Todas</option>
                          <option value="pending">Pendientes</option>
                          <option value="reviewed">Revisadas</option>
                          <option value="approved">Aprobadas</option>
                          <option value="rejected">Rechazadas</option>
                        </select>
                        <select
                          value={filtroArchivadoSugerencias}
                          onChange={(e) => setFiltroArchivadoSugerencias(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="no-archivadas">No archivadas</option>
                          <option value="archivadas">Archivadas</option>
                          <option value="todas">Todas</option>
                        </select>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 overflow-x-auto">
                        <span className="font-medium whitespace-nowrap">Total: {sugerenciasFiltradas.length}</span>
                        <span className="whitespace-nowrap">Pendientes: {sugerencias.filter(s => s.status === 'pending' && !s.archived).length}</span>
                        <span className="whitespace-nowrap">Revisadas: {sugerencias.filter(s => s.status === 'reviewed' && !s.archived).length}</span>
                        <span className="whitespace-nowrap">Aprobadas: {sugerencias.filter(s => s.status === 'approved' && !s.archived).length}</span>
                        <span className="whitespace-nowrap">Archivadas: {sugerencias.filter(s => s.archived).length}</span>
                        <span className="whitespace-nowrap">Destacadas: {sugerencias.filter(s => s.liked && !s.archived).length}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {sugerenciasFiltradas.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <p className="text-gray-500">No hay sugerencias</p>
                        </div>
                      ) : (
                        sugerenciasFiltradas.map(sugerencia => (
                          <div key={sugerencia.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-800 text-base md:text-lg break-words">{sugerencia.product_name}</h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    sugerencia.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    sugerencia.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                    sugerencia.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {sugerencia.status === 'pending' ? '⏳ Pendiente' :
                                     sugerencia.status === 'reviewed' ? '👀 Revisada' :
                                     sugerencia.status === 'approved' ? '✅ Aprobada' :
                                     '❌ Rechazada'}
                                  </span>
                                  {sugerencia.category && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                      {sugerencia.category}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Cliente:</span> {sugerencia.user_name} ({sugerencia.user_email})
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(sugerencia.created_at).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => toggleLikeSugerencia(sugerencia.id)}
                                  className={`p-2 rounded-lg transition shrink-0 ${
                                    sugerencia.liked 
                                      ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  title={sugerencia.liked ? 'Quitar destacado' : 'Destacar'}
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill={sugerencia.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => toggleArchivarSugerencia(sugerencia.id, sugerencia.archived)}
                                  className={`p-2 rounded-lg transition shrink-0 ${
                                    sugerencia.archived 
                                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  title={sugerencia.archived ? 'Desarchivar' : 'Archivar'}
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                </button>
                                {!sugerencia.responded && (
                                  <button
                                    onClick={() => abrirModalRespuestaSugerencia(sugerencia)}
                                    className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                  >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Responder</span>
                                  </button>
                                )}
                                <select
                                  value={sugerencia.status}
                                  onChange={(e) => cambiarEstadoSugerencia(sugerencia.id, e.target.value)}
                                  className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="reviewed">Revisada</option>
                                  <option value="approved">Aprobada</option>
                                  <option value="rejected">Rechazada</option>
                                </select>
                                <button
                                  onClick={() => eliminarSugerenciaConfirm(sugerencia.id, sugerencia.user_name)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {sugerencia.description && (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                                <p className="text-gray-600 whitespace-pre-wrap">{sugerencia.description}</p>
                              </div>
                            )}
                            {sugerencia.responded && sugerencia.response_date && (
                              <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold text-gray-700">Respondido el {new Date(sugerencia.response_date).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="font-medium text-gray-800 mb-1">{sugerencia.response_subject}</p>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{sugerencia.response_message}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {subSeccionComunicacion === 'contactos' && (
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          placeholder="Buscar por nombre, email, asunto o mensaje..."
                          value={busquedaContacto}
                          onChange={(e) => setBusquedaContacto(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={filtroContactos}
                          onChange={(e) => setFiltroContactos(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="todos">Todos</option>
                          <option value="no_leidos">No leídos</option>
                          <option value="leidos">Leídos</option>
                        </select>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 overflow-x-auto">
                        <span className="font-medium whitespace-nowrap">Total: {contactosFiltrados.length}</span>
                        <span className="whitespace-nowrap">No leídos: {contactos.filter(c => !c.leido).length}</span>
                        <span className="whitespace-nowrap">Leídos: {contactos.filter(c => c.leido).length}</span>
                        <span className="whitespace-nowrap">Destacados: {contactos.filter(c => c.liked).length}</span>
                        <span className="whitespace-nowrap">Respondidos: {contactos.filter(c => c.responded).length}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {contactosFiltrados.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <p className="text-gray-500">No hay mensajes de contacto</p>
                        </div>
                      ) : (
                        contactosFiltrados.map(contacto => (
                          <div 
                            key={contacto.id} 
                            className={`bg-white border-2 rounded-lg p-4 md:p-6 hover:shadow-md transition ${
                              !contacto.leido ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  {!contacto.leido && (
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                  )}
                                  <h3 className="font-bold text-gray-800 text-base md:text-lg break-words">{contacto.asunto}</h3>
                                  {!contacto.leido && (
                                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                                      NUEVO
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">De:</span> {contacto.nombre} ({contacto.email})
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(contacto.created_at).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => toggleLikeContacto(contacto.id)}
                                  className={`p-2 rounded-lg transition shrink-0 ${
                                    contacto.liked 
                                      ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                  title={contacto.liked ? 'Quitar destacado' : 'Destacar'}
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill={contacto.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                {!contacto.responded && (
                                  <button
                                    onClick={() => abrirModalRespuestaContacto(contacto)}
                                    className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 md:gap-2 text-sm md:text-base"
                                  >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Responder</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleLeidoContacto(contacto.id, contacto.leido)}
                                  className={`px-3 md:px-4 py-2 rounded-lg transition flex items-center gap-1 md:gap-2 text-sm md:text-base ${
                                    contacto.leido
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  }`}
                                  title={contacto.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {contacto.leido ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    )}
                                  </svg>
                                  <span className="hidden sm:inline">{contacto.leido ? 'Marcar no leído' : 'Marcar leído'}</span>
                                </button>
                                <button
                                  onClick={() => eliminarContactoConfirm(contacto.id, contacto.nombre)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                              <p className="text-gray-700 whitespace-pre-wrap">{contacto.mensaje}</p>
                            </div>
                            {contacto.responded && contacto.response_date && (
                              <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold text-gray-700">Respondido el {new Date(contacto.response_date).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <p className="font-medium text-gray-800 mb-1">{contacto.response_subject}</p>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{contacto.response_message}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {seccionActiva !== 'productos' && seccionActiva !== 'categorias' && seccionActiva !== 'filtros' && seccionActiva !== 'empleados' && seccionActiva !== 'comunicacion' && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">Sección de {seccionActiva} en desarrollo</p>
            </div>
          )}
        </div>
      </div>
      {modalProductoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={cerrarModalProducto}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={guardarProducto} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formProducto.name}
                  onChange={(e) => setFormProducto({...formProducto, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formProducto.description}
                  onChange={(e) => setFormProducto({...formProducto, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formProducto.price}
                    onChange={(e) => setFormProducto({...formProducto, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formProducto.barcode}
                    onChange={(e) => setFormProducto({...formProducto, barcode: e.target.value})}
                    placeholder="EAN-13, EAN-8, UPC..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={formProducto.category}
                  onChange={(e) => setFormProducto({...formProducto, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formProducto.stock_quantity}
                    onChange={(e) => setFormProducto({...formProducto, stock_quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formProducto.min_stock}
                    onChange={(e) => setFormProducto({...formProducto, min_stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  value={formProducto.is_available ? 'disponible' : 'no_disponible'}
                  onChange={(e) => setFormProducto({...formProducto, is_available: e.target.value === 'disponible'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="disponible">Disponible</option>
                  <option value="no_disponible">No disponible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={formProducto.image}
                  onChange={(e) => setFormProducto({...formProducto, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alérgenos</label>
                <div className="flex flex-wrap gap-2">
                  {alergenos.map(alergeno => (
                    <button
                      key={alergeno.id}
                      type="button"
                      onClick={() => toggleAlergeno(alergeno.id)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        formProducto.allergens.includes(alergeno.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {alergeno.icon} {alergeno.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        formProducto.tags.includes(tag.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalProducto}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {productoEditando ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalCategoriaAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={cerrarModalCategoria} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={guardarCategoria} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Categoría *</label>
                <input
                  type="text"
                  required
                  value={formCategoria.id}
                  onChange={(e) => setFormCategoria({...formCategoria, id: e.target.value})}
                  placeholder="ej: lacteos, panaderia"
                  disabled={categoriaEditando !== null}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {categoriaEditando ? 'El ID no puede modificarse' : 'Se convertirá a minúsculas y espacios en guiones bajos'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formCategoria.name}
                  onChange={(e) => setFormCategoria({...formCategoria, name: e.target.value})}
                  placeholder="ej: Lácteos, Panadería"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formCategoria.description}
                  onChange={(e) => setFormCategoria({...formCategoria, description: e.target.value})}
                  rows={3}
                  placeholder="Descripción de la categoría"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono Emoji *</label>
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={formCategoria.icon}
                      onChange={(e) => setFormCategoria({...formCategoria, icon: e.target.value})}
                      placeholder="📦"
                      maxLength={4}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-3xl"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Escribe o pega cualquier emoji</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Puedes buscar emojis en: <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Emojipedia</a> o usar Windows + . (punto)
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">O selecciona uno de estos emojis populares:</p>
                    <div className="flex flex-wrap gap-2">
                      {['🥛', '🍞', '🍖', '🥬', '🍎', '🧃', '🍫', '🧀', '🥫', '🍕', '🍰', '🥤', '🍺', '🍷', '🥐', '🥨', '🥓', '🥚', '🍗', '🥗', '🍝', '🍜', '🍱', '🍛', '🍣', '🍤', '🍦', '🥧', '🍩', '🍪'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormCategoria({...formCategoria, icon: emoji})}
                          className={`text-2xl p-2 rounded-lg border-2 transition hover:scale-110 ${
                            formCategoria.icon === emoji 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {categoriaEditando && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold">Productos asociados: {contarProductosPorCategoria(categoriaEditando.id)}</p>
                      <p className="text-xs mt-1">Los cambios afectarán a todos los productos de esta categoría</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalCategoria}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {categoriaEditando ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalAlergenoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {alergenoEditando ? 'Editar Alérgeno' : 'Nuevo Alérgeno'}
              </h3>
              <button
                onClick={cerrarModalAlergeno}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={guardarAlergeno} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Alérgeno *</label>
                <input
                  type="text"
                  required
                  value={formAlergeno.name}
                  onChange={(e) => setFormAlergeno({...formAlergeno, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Gluten, Lácteos, Frutos secos..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono / Emoji *</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl border-2 border-gray-300">
                      {formAlergeno.icon}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={formAlergeno.icon}
                        onChange={(e) => setFormAlergeno({...formAlergeno, icon: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pega o escribe un emoji"
                      />
                      <p className="text-sm text-gray-600 mt-1">Escribe o pega cualquier emoji</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Usa Windows + . (punto) para abrir el selector de emojis
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">O selecciona uno de estos emojis comunes:</p>
                    <div className="flex flex-wrap gap-2">
                      {['⚠️', '🥛', '🍞', '🥜', '🥚', '🐟', '🦐', '🌰', '🧈', '🫘', '🌾', '🦞', '🥥', '🍯', '🧀', '🥬', '🫑', '🍅', '🥕', '🌽'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormAlergeno({...formAlergeno, icon: emoji})}
                          className={`text-2xl p-2 rounded-lg border-2 transition hover:scale-110 ${
                            formAlergeno.icon === emoji 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formAlergeno.description}
                  onChange={(e) => setFormAlergeno({...formAlergeno, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del alérgeno"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alimentos comunes
                  <span className="text-xs text-gray-500 ml-2">(separar por comas)</span>
                </label>
                <textarea
                  value={formAlergeno.alimentos_comunes}
                  onChange={(e) => setFormAlergeno({...formAlergeno, alimentos_comunes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Pan, Pasta, Galletas"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lista de alimentos que contienen este alérgeno
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  También conocido como
                  <span className="text-xs text-gray-500 ml-2">(separar por comas)</span>
                </label>
                <textarea
                  value={formAlergeno.tambien_conocido_como}
                  onChange={(e) => setFormAlergeno({...formAlergeno, tambien_conocido_como: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Trigo, Wheat, Gluten de trigo"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nombres alternativos del alérgeno
                </p>
              </div>

              {alergenoEditando && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold">Productos asociados: {contarProductosPorAlergeno(alergenoEditando.name)}</p>
                      <p className="text-xs mt-1">Los cambios afectarán a todos los productos con este alérgeno</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalAlergeno}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {alergenoEditando ? 'Guardar Cambios' : 'Crear Alérgeno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalTagAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {tagEditando ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </h3>
              <button
                onClick={cerrarModalTag}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={guardarTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Etiqueta *</label>
                <input
                  type="text"
                  required
                  value={formTag.name}
                  onChange={(e) => setFormTag({...formTag, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Vegano, Sin Gluten, Eco..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formTag.description}
                  onChange={(e) => setFormTag({...formTag, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción opcional de la etiqueta..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center border-2 border-gray-300"
                      style={{ backgroundColor: formTag.color }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <input
                        type="color"
                        required
                        value={formTag.color}
                        onChange={(e) => setFormTag({...formTag, color: e.target.value})}
                        className="w-full h-10 px-2 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <p className="text-sm text-gray-600 mt-1">Haz clic para seleccionar un color</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">O selecciona uno de estos colores predefinidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '#3B82F6', 
                        '#10B981', 
                        '#F59E0B', 
                        '#EF4444', 
                        '#8B5CF6', 
                        '#EC4899', 
                        '#6366F1',
                        '#14B8A6',
                        '#F97316', 
                        '#84CC16', 
                        '#06B6D4', 
                        '#A855F7', 
                        '#64748B', 
                        '#78716C', 
                        '#0EA5E9', 
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormTag({...formTag, color: color})}
                          className={`w-10 h-10 rounded-lg border-2 transition hover:scale-110 ${
                            formTag.color === color 
                              ? 'border-gray-800 shadow-md' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {tagEditando && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Productos asociados: {contarProductosPorTag(tagEditando.name)}</p>
                      <p className="text-xs mt-1">Los cambios afectarán a todos los productos con esta etiqueta</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalTag}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {tagEditando ? 'Guardar Cambios' : 'Crear Etiqueta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalAsignacionCategoriaAbierto && categoriaParaAsignar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoriaParaAsignar.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Asignar Categoría: {categoriaParaAsignar.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Selecciona los productos para esta categoría (solo una categoría por producto)
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalAsignacionCategoria}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {productos.filter(p => p.category === categoriaParaAsignar.id).length > 0 && (
                <button
                  onClick={() => quitarTodosProductosCategoria(categoriaParaAsignar.id)}
                  className="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Quitar categoría de todos los productos ({productos.filter(p => p.category === categoriaParaAsignar.id).length})
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busquedaAsignacionCategoria}
                    onChange={(e) => setBusquedaAsignacionCategoria(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos
                  .filter(p => p.name.toLowerCase().includes(busquedaAsignacionCategoria.toLowerCase()))
                  .map(producto => {
                  const tieneCategoria = producto.category === categoriaParaAsignar.id
                  const tieneOtraCategoria = producto.category && producto.category !== categoriaParaAsignar.id
                  return (
                    <div
                      key={producto.id}
                      className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        tieneCategoria 
                          ? 'border-green-500 bg-green-50' 
                          : tieneOtraCategoria
                          ? 'border-gray-300 bg-gray-50 opacity-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => !tieneOtraCategoria && toggleCategoriaEnProducto(producto.id, categoriaParaAsignar.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {tieneCategoria ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full border-2 ${tieneOtraCategoria ? 'border-gray-300' : 'border-gray-400'}`}></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{producto.name}</h4>
                          <p className="text-sm text-gray-600">{producto.price}€</p>
                          {tieneOtraCategoria && (
                            <p className="text-xs text-orange-600 mt-1">
                              Ya tiene otra categoría asignada
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {modalAsignacionAlergenoAbierto && alergenoParaAsignar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{alergenoParaAsignar.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Asignar Alérgeno: {alergenoParaAsignar.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Marca los productos que contienen este alérgeno
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalAsignacionAlergeno}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {productos.filter(p => p.allergens && p.allergens.some(a => a === alergenoParaAsignar.id || a === alergenoParaAsignar.name)).length > 0 && (
                <button
                  onClick={() => quitarTodosProductosAlergeno(alergenoParaAsignar.id)}
                  className="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Quitar alérgeno de todos los productos ({productos.filter(p => p.allergens && p.allergens.some(a => a === alergenoParaAsignar.id || a === alergenoParaAsignar.name)).length})
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busquedaAsignacionAlergeno}
                    onChange={(e) => setBusquedaAsignacionAlergeno(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos
                  .filter(p => p.name.toLowerCase().includes(busquedaAsignacionAlergeno.toLowerCase()))
                  .map(producto => {
                  const allergens = producto.allergens || []
                  const alergenoObj = alergenos.find(a => a.id === alergenoParaAsignar.id || a.name === alergenoParaAsignar.name)
                  const tieneAlergeno = allergens.some(a => 
                    a === alergenoParaAsignar.id || 
                    a === alergenoObj?.id || 
                    a === alergenoObj?.name
                  )
                  return (
                    <div
                      key={producto.id}
                      className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        tieneAlergeno 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleAlergenoEnProducto(producto.id, alergenoParaAsignar.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {tieneAlergeno ? (
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded border-2 border-gray-400"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{producto.name}</h4>
                          <p className="text-sm text-gray-600">{producto.price}€</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {modalAsignacionTagAbierto && tagParaAsignar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tagParaAsignar.color + '20' }}
                  >
                    <svg className="w-6 h-6" style={{ color: tagParaAsignar.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Asignar Etiqueta: {tagParaAsignar.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Marca los productos con esta etiqueta
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalAsignacionTag}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {productos.filter(p => p.tags && p.tags.some(t => t === tagParaAsignar.id || t === tagParaAsignar.name)).length > 0 && (
                <button
                  onClick={() => quitarTodosProductosTag(tagParaAsignar.id)}
                  className="w-full px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Quitar etiqueta de todos los productos ({productos.filter(p => p.tags && p.tags.some(t => t === tagParaAsignar.id || t === tagParaAsignar.name)).length})
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busquedaAsignacionTag}
                    onChange={(e) => setBusquedaAsignacionTag(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos
                  .filter(p => p.name.toLowerCase().includes(busquedaAsignacionTag.toLowerCase()))
                  .map(producto => {
                  const productTags = producto.tags || []
                  const tagObj = tags.find(t => t.id === tagParaAsignar.id || t.name === tagParaAsignar.name)
                  const tieneTag = productTags.some(t => 
                    t === tagParaAsignar.id || 
                    t === tagObj?.id || 
                    t === tagObj?.name
                  )
                  return (
                    <div
                      key={producto.id}
                      className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                        tieneTag 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleTagEnProducto(producto.id, tagParaAsignar.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {tieneTag ? (
                            <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded border-2 border-gray-400"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{producto.name}</h4>
                          <p className="text-sm text-gray-600">{producto.price}€</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {modalEmpleadoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Agregar Empleado</h3>
                <p className="text-sm text-gray-600">Puede ser un usuario nuevo o existente</p>
              </div>
              <button
                onClick={cerrarModalEmpleado}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitEmpleado} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmpleado.email}
                  onChange={(e) => setFormEmpleado({ ...formEmpleado, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="empleado@lapiconera.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si el usuario ya existe, será promovido o reactivado
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formEmpleado.name}
                  onChange={(e) => setFormEmpleado({ ...formEmpleado, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez (solo para usuarios nuevos)"
                />
                <p className="text-xs text-gray-500 mt-1">Opcional si el usuario ya existe</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={formEmpleado.password}
                  onChange={(e) => setFormEmpleado({ ...formEmpleado, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres (solo usuarios nuevos)"
                />
                <p className="text-xs text-gray-500 mt-1">Solo requerida para usuarios nuevos</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModalEmpleado}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Agregar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalRespuestaSugerenciaAbierto && sugerenciaRespondiendo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Responder Sugerencia</h3>
                <p className="text-sm text-gray-600">Para: {sugerenciaRespondiendo.user_name} ({sugerenciaRespondiendo.user_email})</p>
              </div>
              <button
                onClick={cerrarModalRespuestaSugerencia}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Producto sugerido:</p>
                <p className="text-lg font-bold text-gray-800 mb-2">{sugerenciaRespondiendo.product_name}</p>
                {sugerenciaRespondiendo.description && (
                  <>
                    <p className="text-sm font-semibold text-gray-700 mb-1 mt-3">Descripción:</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{sugerenciaRespondiendo.description}</p>
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRespuesta.subject}
                    onChange={(e) => setFormRespuesta({ ...formRespuesta, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Asunto del email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formRespuesta.message}
                    onChange={(e) => setFormRespuesta({ ...formRespuesta, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Información del envío:</p>
                      <p>• Se enviará desde: tiendalapiconera@gmail.com</p>
                      <p>• El cliente podrá responder a ese email</p>
                      <p>• Se marcará la sugerencia como respondida</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cerrarModalRespuestaSugerencia}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={enviarRespuestaSugerencia}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Respuesta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalRespuestaContactoAbierto && contactoRespondiendo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Responder Mensaje</h3>
                <p className="text-sm text-gray-600">Para: {contactoRespondiendo.nombre} ({contactoRespondiendo.email})</p>
              </div>
              <button
                onClick={cerrarModalRespuestaContacto}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Asunto original:</p>
                <p className="text-lg font-bold text-gray-800 mb-3">{contactoRespondiendo.asunto}</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">Mensaje:</p>
                <p className="text-gray-600 whitespace-pre-wrap">{contactoRespondiendo.mensaje}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRespuesta.subject}
                    onChange={(e) => setFormRespuesta({ ...formRespuesta, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Asunto del email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formRespuesta.message}
                    onChange={(e) => setFormRespuesta({ ...formRespuesta, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Información del envío:</p>
                      <p>• Se enviará desde: tiendalapiconera@gmail.com</p>
                      <p>• El cliente podrá responder a ese email</p>
                      <p>• Se marcará el contacto como respondido y leído</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cerrarModalRespuestaContacto}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={enviarRespuestaContacto}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Respuesta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
