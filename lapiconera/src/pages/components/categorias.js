export default function Categorias({ categorias, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 border-b border-gray-200">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium transition ${
          selected === null
            ? 'bg-[#3B82F6] text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        Todos
      </button>

      {categorias.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}   
          className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium transition ${
            selected === cat.id
              ? 'bg-[#3B82F6] text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
