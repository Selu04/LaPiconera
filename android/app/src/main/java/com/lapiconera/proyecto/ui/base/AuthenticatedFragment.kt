package com.lapiconera.proyecto.ui.base

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.data.session.SessionManager

/**
 * Fragment base que requiere autenticación.
 * Verifica automáticamente si el usuario está logueado al crear la vista.
 * Si no está logueado, redirige al LoginFragment.
 */
abstract class AuthenticatedFragment : Fragment() {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (!isUserLoggedIn()) {
            redirectToLogin()
            return
        }
    }

    /**
     * Verifica si el usuario tiene una sesión activa
     */
    private fun isUserLoggedIn(): Boolean {
        val token = SessionManager.getToken(requireContext())
        return !token.isNullOrEmpty()
    }

    /**
     * Redirige al login y limpia el back stack para que no pueda volver atrás
     */
    private fun redirectToLogin() {
        try {
            SessionManager.clearSession(requireContext())

            findNavController().navigate(R.id.loginFragment)
        } catch (e: Exception) {
            try {
                findNavController().popBackStack(R.id.loginFragment, false)
            } catch (ex: Exception) {
                requireActivity().finish()
            }
        }
    }

    /**
     * Verifica la sesión manualmente en cualquier momento
     */
    protected fun checkSessionAndRedirect() {
        if (!isUserLoggedIn()) {
            redirectToLogin()
        }
    }
}

