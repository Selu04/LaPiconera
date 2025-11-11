import { useEffect, useState } from 'react'
import Header from './components/Header'
import Filtros from './components/filtros'
import Categorias from './components/categorias'
import ProductoCard from './components/ProductoCard'
import { getCategorias } from './api/categorias'
import { getAlergenos } from './api/alergenos'
import { getTags } from './api/tags'
export default function Home() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [alergenos, setAlergenos] = useState([])
  const [tags, setTags] = useState([])
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedAlergenos, setSelectedAlergenos] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [absoluteMax, setAbsoluteMax] = useState(0)
  useEffect(() => {
    getCategorias().then(setCategorias)
    getAlergenos().then(setAlergenos)
    getTags().then(setTags)
  }, [])
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const params = new URLSearchParams()
        if (selectedCategoria) params.append('categoria', selectedCategoria)
        if (selectedAlergenos.length) params.append('alergenos', selectedAlergenos.join(','))
        if (selectedTags.length) params.append('tags', selectedTags.join(','))
        if (search) params.append('search', search)
        if (minPrice) params.append('minPrice', minPrice)
        if (maxPrice && maxPrice !== absoluteMax) params.append('maxPrice', maxPrice)
        const res = await fetch(`/api/productos?${params.toString()}`)
        const data = await res.json()
        setProductos(data)
        if (data.length > 0 && absoluteMax === 0) {
          const maxProd = Math.max(...data.map(p => Number(p.price)))
          setAbsoluteMax(maxProd)
          setMaxPrice(maxProd)
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    }
    cargarProductos()
  }, [selectedCategoria, selectedAlergenos, selectedTags, search, minPrice, maxPrice])
  useEffect(() => {
    if (productos.length > 0 && absoluteMax === 0) {
      const maxProd = Math.max(...productos.map(p => Number(p.price)))
      setAbsoluteMax(maxProd)
      if (maxPrice === 0) {
        setMaxPrice(maxProd)
      }
    }
  }, [])
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-64 p-4 bg-white border-r">
          <Filtros
            alergenos={alergenos}
            tags={tags}
            selectedAlergenos={selectedAlergenos}
            setSelectedAlergenos={setSelectedAlergenos}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            productos={productos}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            absoluteMax={absoluteMax}
          />
        </div>
        <main className="flex-1 p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 rounded-lg w-full stroke-red-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>
          <Categorias
            categorias={categorias}
            selected={selectedCategoria}
            onSelect={setSelectedCategoria}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {productos.map(p => (
              <ProductoCard key={p.id} producto={p} allTags={tags} allAlergenos={alergenos} />
            ))}
            {productos.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center bg-gray-50 border rounded-lg py-12">
                <p className="text-gray-700 font-medium">
                  No hay productos que coincidan con los filtros.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}