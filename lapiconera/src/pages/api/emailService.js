const EMAILJS_PUBLIC_KEY = 'kJFppQCsbhYLuns4C'
const EMAILJS_PRIVATE_KEY = 'zVtoLGEjzyca3QxslyWL0'
const EMAILJS_SERVICE_ID = 'service_u84p3a5'
const EMAILJS_TEMPLATE_ORDER = 'order_notification'
const EMAILJS_TEMPLATE_RESPONSE = 'response'
async function sendEmailJS(serviceId, templateId, templateParams, publicKey, privateKey) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: templateParams
    })
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EmailJS Error: ${errorText}`)
  }
  return response
}
export async function enviarConfirmacionPedido(pedido) {
  try {
    const productosTexto = pedido.order_items
      .map(item => `• ${item.product_name} x${item.quantity} - €${Number(item.subtotal).toFixed(2)}`)
      .join('\n')
    const mensaje = `Hola ${pedido.user_name},
¡Hemos recibido tu pedido correctamente!
Pedido #${pedido.id.slice(0, 8).toUpperCase()}
Productos:
${productosTexto}
Total: €${Number(pedido.total).toFixed(2)}
Estado: Pendiente de preparación
Te enviaremos un email cuando tu pedido esté listo para recoger en nuestra tienda.
¡Gracias por confiar en nosotros!
Equipo de La Piconera`
    const templateParams = {
      to_email: pedido.user_email,
      from_name: 'La Piconera',
      reply_to: 'tiendalapiconera@gmail.com',
      subject: 'Confirmación de pedido - La Piconera 📦',
      message: mensaje
    }
    const response = await sendEmailJS(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ORDER,
      templateParams,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY
    )
    return { success: true, response }
  } catch (error) {
    console.error('Error al enviar email de confirmación:', error)
    throw error
  }
}
export async function enviarNotificacionPedidoListo(pedido) {
  try {
    const productosTexto = pedido.order_items
      .map(item => `• ${item.product_name} x${item.quantity} - €${Number(item.subtotal).toFixed(2)}`)
      .join('\n')
    const mensaje = `Hola ${pedido.user_name},
¡Tu pedido #${pedido.id.slice(0, 8).toUpperCase()} está listo para recoger!
Productos:
${productosTexto}
Total: €${Number(pedido.total).toFixed(2)}
Puedes pasar a recogerlo en nuestra tienda. Recuerda que tu pedido estará reservado durante 2 horas.
¡Gracias por tu compra!
Equipo de La Piconera`
    const templateParams = {
      to_email: pedido.user_email,
      from_name: 'La Piconera',
      reply_to: 'tiendalapiconera@gmail.com',
      subject: '¡Tu pedido está listo para recoger! 📦',
      message: mensaje
    }
    const response = await sendEmailJS(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ORDER,
      templateParams,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY
    )
    return { success: true, response }
  } catch (error) {
    console.error('Error al enviar email:', error)
    throw error
  }
}
export async function sendEmail({ to, template, subject, variables }) {
  try {
    const templateId = template === 'response' ? EMAILJS_TEMPLATE_RESPONSE : EMAILJS_TEMPLATE_ORDER
    const templateParams = {
      to_email: to,
      from_name: 'La Piconera',
      reply_to: variables.reply_to || 'tiendalapiconera@gmail.com',
      subject: subject,
      message: variables.formatted_message || variables.message || '',
      formatted_message: variables.formatted_message || variables.message || '',
      from_email: variables.from_email || 'tiendalapiconera@gmail.com'
    }
    const response = await sendEmailJS(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY,
      EMAILJS_PRIVATE_KEY
    )
    return { success: true, response }
  } catch (error) {
    console.error('Error al enviar email:', error)
    throw new Error(`Error al enviar email: ${error.message}`)
  }
}
