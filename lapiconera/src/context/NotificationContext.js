import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    const notification = { id, message, type }
    
    setNotifications(prev => {
      const newNotifications = [...prev, notification]
      return newNotifications
    })
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 6000)
  }, [])

  const showSuccess = useCallback((message) => showNotification(message, 'success'), [showNotification])
  const showError = useCallback((message) => showNotification(message, 'error'), [showNotification])
  const showInfo = useCallback((message) => showNotification(message, 'info'), [showNotification])
  const showWarning = useCallback((message) => showNotification(message, 'warning'), [showNotification])

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => {
          setConfirmDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmDialog(null)
          resolve(false)
        }
      })
    })
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      showSuccess, 
      showError, 
      showInfo, 
      showWarning,
      showConfirm 
    }}>
      {children}
      
      <div style={{ 
        position: 'fixed', 
        top: '16px', 
        right: '16px', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              animation: 'slideInRight 0.3s ease-out',
              pointerEvents: 'auto',
              minWidth: '300px',
              maxWidth: '400px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backgroundColor: 
                notification.type === 'success' ? '#10b981' :
                notification.type === 'error' ? '#ef4444' :
                notification.type === 'warning' ? '#f59e0b' :
                '#3b82f6',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flexShrink: 0 }}>
                {notification.type === 'success' && (
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, margin: 0 }}>{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                style={{ 
                  flexShrink: 0, 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: 0,
                  color: '#ffffff',
                  opacity: 0.9
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', animation: 'fadeIn 0.2s ease-out', zIndex: 99999 }}>
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            <div className="p-6 bg-white rounded-t-lg">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmDialog.type === 'danger' ? 'bg-red-100' :
                  confirmDialog.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {confirmDialog.type === 'danger' && (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {confirmDialog.type === 'warning' && (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {!confirmDialog.type && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {confirmDialog.title || '¿Estás seguro?'}
                  </h3>
                  <p className="text-gray-600">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 rounded-b-lg" style={{ backgroundColor: '#f9fafb' }}>
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="flex-1 px-4 py-2 rounded-lg transition font-semibold"
                style={{ 
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d5db',
                  color: '#374151'
                }}
              >
                {confirmDialog.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2 rounded-lg transition font-semibold"
                style={{
                  backgroundColor: confirmDialog.type === 'danger' ? '#dc2626' :
                                   confirmDialog.type === 'warning' ? '#d97706' :
                                   '#2563eb',
                  color: '#ffffff'
                }}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }
  return context
}
