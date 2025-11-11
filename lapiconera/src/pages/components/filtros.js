import * as Slider from "@radix-ui/react-slider"

export default function Filtros({
  alergenos,
  tags,
  selectedAlergenos,
  setSelectedAlergenos,
  selectedTags,
  setSelectedTags,
  productos,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  absoluteMax
}) {
  const maxProducto = productos.length > 0 ? Math.max(...productos.map(p => Number(p.price))) : 100

  const handlePriceRangeChange = (values) => {
    setMinPrice(values[0])
    setMaxPrice(values[1])
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Excluir Alérgenos</h3>
        <div className="flex flex-col gap-1">
          {alergenos.map(a => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedAlergenos.includes(a.id)}
                onChange={() =>
                  setSelectedAlergenos(
                    selectedAlergenos.includes(a.id)
                      ? selectedAlergenos.filter(x => x !== a.id)
                      : [...selectedAlergenos, a.id]
                  )
                }
              />
              {a.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
        <div className="flex flex-col gap-1">
          {tags.map(t => (
            <label key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedTags.includes(t.id)}
                onChange={() =>
                  setSelectedTags(
                    selectedTags.includes(t.id)
                      ? selectedTags.filter(x => x !== t.id)
                      : [...selectedTags, t.id]
                  )
                }
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Rango de precios</h3>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={minPrice}
            min={0}
            max={maxPrice - 1}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1 text-sm text-black"
          />
          <span>-</span>
          <input
            type="number"
            value={maxPrice}
            min={minPrice + 1}
            max={maxProducto}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1 text-sm text-black"
          />
          <span className="text-black">€</span>
        </div>

        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[minPrice, maxPrice]}
          onValueChange={(values) => {
            setMinPrice(values[0])
            setMaxPrice(values[1])
          }}
          min={0}
          max={absoluteMax}
          step={1}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-[#3B82F6] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-[#3B82F6] rounded-full shadow focus:outline-none" />
          <Slider.Thumb className="block w-4 h-4 bg-[#3B82F6] rounded-full shadow focus:outline-none" />
        </Slider.Root>

      </div>
    </div>
  )
}
