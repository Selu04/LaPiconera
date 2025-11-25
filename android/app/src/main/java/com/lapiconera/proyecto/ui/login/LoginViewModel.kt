package com.lapiconera.proyecto.ui.login

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.LoginRequest
import kotlinx.coroutines.launch
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class LoginViewModel : ViewModel() {

    val loginResult = MutableLiveData<Boolean>()
    val errorMessage = MutableLiveData<String>()
    val isLoading = MutableLiveData<Boolean>()
    lateinit var userId: String

    fun login(username: String, password: String) {
        viewModelScope.launch {
            isLoading.postValue(true)
            try {
                val response = RetrofitClient.api.login(LoginRequest(username, password))

                Log.d("LoginViewModel", "Response code: ${response.code()}")

                if (response.isSuccessful) {
                    val body = response.body()
                    Log.d("LoginViewModel", "Response body: $body")

                    if (body != null && body.trabajador) {
                        userId = body.id.toString()
                        loginResult.postValue(true)
                        errorMessage.postValue("")
                    } else {
                        loginResult.postValue(false)
                        errorMessage.postValue("No tienes permisos de trabajador")
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("LoginViewModel", "Error body: $errorBody")
                    loginResult.postValue(false)

                    val mensaje = when (response.code()) {
                        401 -> "Credenciales incorrectas"
                        403 -> "Usuario inactivo"
                        404 -> "Usuario no encontrado"
                        500 -> "Error del servidor. Intenta de nuevo"
                        else -> "Error al iniciar sesión"
                    }
                    errorMessage.postValue(mensaje)
                }
            } catch (e: Exception) {
                Log.e("LoginViewModel", "Exception during login", e)
                loginResult.postValue(false)

                val mensaje = when (e) {
                    is ConnectException -> "No se puede conectar al servidor. Verifica tu conexión"
                    is SocketTimeoutException -> "Tiempo de espera agotado. Intenta de nuevo"
                    is UnknownHostException -> "No se puede resolver el servidor. Verifica tu conexión"
                    else -> "Error de conexión: ${e.localizedMessage}"
                }
                errorMessage.postValue(mensaje)
            } finally {
                isLoading.postValue(false)
            }
        }
    }
}
