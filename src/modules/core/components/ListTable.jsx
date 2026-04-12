import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ListTable({ 
  columns, 
  data = [], 
  onDelete, 
  editLinkPrefix, 
  loading, 
  renderActions,
  searchTerm,
  setSearchTerm,
  currentPage,
  handlePageChange,
  totalItems = 0,
  itemsPerPage = 10
}) {
  
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className='card-premium flex flex-col gap-4 overflow-hidden'>
      <div className='relative'>
        <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search className='h-5 w-5 text-slate-400' />
        </span>
        <input 
          type='text' 
          className='input-premium pl-10' 
          placeholder='Pesquisar no banco de dados...' 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='overflow-x-auto -mx-6'>
        <table className='w-full text-left border-collapse min-w-[600px]'>
          <thead>
            <tr className='bg-slate-50/50 border-y border-slate-100'>
              {columns.map((col, idx) => (
                <th key={idx} className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  {col.header}
                </th>
              ))}
              <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right'>
                Ações
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-50'>
            {loading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <tr key={i}>
                   {columns.map((_, idx) => (
                     <td key={idx} className='px-6 py-4'>
                       <div className='h-4 bg-slate-100 rounded-md animate-pulse'></div>
                     </td>
                   ))}
                   <td className='px-6 py-4'>
                     <div className='h-4 bg-slate-100 rounded-md animate-pulse w-1/2 ml-auto'></div>
                   </td>
                 </tr>
               ))
            ) : data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={item.id || idx} className='group hover:bg-slate-50/30 transition-colors duration-200'>
                  {columns.map((col, colIdx) => (
                      <td key={colIdx} className='px-6 py-4 text-sm text-slate-600 font-medium'>
                          {col.accessor(item)}
                      </td>
                  ))}
                  <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity'>
                         {renderActions ? (
                             renderActions(item)
                         ) : (
                             <>
                                {editLinkPrefix && (
                                    <Link 
                                        to={`${editLinkPrefix}/${item.id}`} 
                                        className='p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                                    >
                                        <Edit2 size={18}/>
                                    </Link>
                                )}
                                <button 
                                    onClick={() => onDelete && onDelete(item)}
                                    className='p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors'
                                >
                                    <Trash2 size={18}/>
                                </button>
                             </>
                         )}
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className='px-6 py-10 text-center text-slate-400 font-medium'>
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-4 border-t border-slate-100 mt-auto'>
          <div className='text-sm text-slate-500'>
             Total de <span className='font-medium'>{totalItems}</span> registros
          </div>
          <div className='flex gap-2'>
            <button 
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className='p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-500 transition-colors'
            >
               <ChevronLeft size={20}/>
            </button>
            <span className='flex items-center px-4 text-sm font-bold text-slate-700'>
                {currentPage} / {totalPages}
            </span>
            <button 
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className='p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 text-slate-500 transition-colors'
            >
               <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
