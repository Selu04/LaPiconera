import { supabase } from './supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return obtenerEmpleadosHandler(req, res)
  } else if (req.method === 'POST') {
    return crearEmpleadoHandler(req, res)
  } else if (req.method === 'PUT') {
    return actualizarRolHandler(req, res)
  } else if (req.method === 'DELETE') {
    return eliminarEmpleadoHandler(req, res)
  }
  return res.status(405).json({ error: 'Método no permitido' })
}

async function obtenerEmpleadosHandler(req, res) {
  try {
    const empleados = await obtenerEmpleados()
    return res.status(200).json({ empleados })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

async function crearEmpleadoHandler(req, res) {
  try {
    const { email, password, name } = req.body
    const empleado = await crearEmpleadoFunc(email, password, name)
    return res.status(200).json({ empleado })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

async function actualizarRolHandler(req, res) {
  try {
    const { id, role } = req.body
    const empleado = await actualizarRolFunc(id, role)
    return res.status(200).json({ empleado })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

async function eliminarEmpleadoHandler(req, res) {
  try {
    const { id } = req.body
    await eliminarEmpleadoFunc(id)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}


export const getEmpleados = async () => {
  const res = await fetch('/api/empleados')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.empleados
}

export const crearEmpleado = async (email, password, name) => {
  const res = await fetch('/api/empleados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.empleado
}

export const actualizarRol = async (id, role) => {
  const res = await fetch('/api/empleados', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, role })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.empleado
}

export const eliminarEmpleado = async (id) => {
  const res = await fetch('/api/empleados', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return true
}


async function obtenerEmpleados() {
  const { data: activos, error: activosError } = await supabase
    .from('users')
    .select('id, email, name, role, created_at, is_active')
    .in('role', ['employee', 'admin'])
    .eq('is_active', true)

  if (activosError) throw activosError

  const { data: inactivos, error: inactivosError } = await supabase
    .from('users')
    .select('id, email, name, role, created_at, is_active, previous_role')
    .eq('role', 'customer')
    .eq('is_active', false)

  if (inactivosError) throw inactivosError

  const todos = [...(activos || []), ...(inactivos || [])]
  todos.sort((a, b) => {
    if (a.is_active === b.is_active) {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    return a.is_active ? -1 : 1
  })

  return todos
}

async function crearEmpleadoFunc(email, password, name) {
  if (!email || !email.trim()) {
    throw new Error('El email es requerido')
  }

  const { data: usuarioExistente, error: buscarError } = await supabase
    .from('users')
    .select('id, email, name, role, is_active, previous_role')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (usuarioExistente) {
    if ((usuarioExistente.role === 'employee' || usuarioExistente.role === 'admin') && usuarioExistente.is_active) {
      throw new Error('Este usuario ya es un empleado activo')
    }
    
    if (usuarioExistente.role === 'customer' && !usuarioExistente.is_active && usuarioExistente.previous_role) {
      const { data: reactivado, error: reactivarError } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          role: usuarioExistente.previous_role,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioExistente.id)
        .select()
        .single()

      if (reactivarError) throw reactivarError
      return reactivado
    }

    if (usuarioExistente.role === 'customer' && usuarioExistente.is_active) {
      const { data: promovido, error: promoverError } = await supabase
        .from('users')
        .update({ 
          role: 'employee',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioExistente.id)
        .select()
        .single()

      if (promoverError) throw promoverError
      return promovido
    }

    if (usuarioExistente.role === 'customer' && !usuarioExistente.is_active) {
      const { data: promovido, error: promoverError } = await supabase
        .from('users')
        .update({ 
          role: 'employee',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioExistente.id)
        .select()
        .single()

      if (promoverError) throw promoverError
      return promovido
    }
  }

  if (!name || !name.trim()) {
    throw new Error('El nombre es requerido para crear un nuevo usuario')
  }
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error

  const user = data.user
  if (!user) throw new Error('No se pudo crear el usuario')

  const { data: empleado, error: insertError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email: user.email,
      name: name.trim(),
      role: "employee",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) throw insertError

  return empleado
}

async function actualizarRolFunc(id, newRole) {
  if (!['employee', 'admin'].includes(newRole)) {
    throw new Error('Rol inválido')
  }

  if (newRole === 'employee') {
    const { data: admins, error: countError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (countError) throw countError
    
    if (admins.length <= 1) {
      throw new Error('Debe haber al menos un administrador activo')
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

async function eliminarEmpleadoFunc(id) {
  const { data: usuario, error: getUserError } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', id)
    .single()

  if (getUserError) throw getUserError

  if (usuario.role === 'admin' && usuario.is_active) {
    const { data: admins, error: countError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (countError) throw countError
    
    if (admins.length <= 1) {
      throw new Error('No se puede desactivar al último administrador activo')
    }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      is_active: false,
      previous_role: usuario.role,
      role: 'customer',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) throw updateError
  
  return true
}
