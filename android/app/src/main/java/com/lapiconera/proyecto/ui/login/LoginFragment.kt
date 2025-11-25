package com.lapiconera.proyecto.ui.login

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.CircleCrop
import com.lapiconera.proyecto.R
import com.lapiconera.proyecto.databinding.FragmentLoginBinding
import com.lapiconera.proyecto.util.Constantes

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!
    private val loginViewModel: LoginViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Glide.with(requireContext())
            .load("https://oeakibkrouxtehvwjmlz.supabase.co/storage/v1/object/public/logos//logo_empresa.png")
            .transform(CircleCrop())
            .into(binding.imgLogo)

        setupClickListeners()
        setupObservers()
    }

    private fun setupClickListeners() {
        binding.btnLogin.setOnClickListener {
            val username = binding.etUsername.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (username.isNotBlank() && password.isNotBlank()) {
                loginViewModel.login(username, password)
            } else {
                Toast.makeText(requireContext(), "Completa todos los campos", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupObservers() {
        loginViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            if (isLoading) {
                binding.progressBar.visibility = View.VISIBLE
                binding.btnLogin.isEnabled = false
                binding.etUsername.isEnabled = false
                binding.etPassword.isEnabled = false
            } else {
                binding.progressBar.visibility = View.GONE
                binding.btnLogin.isEnabled = true
                binding.etUsername.isEnabled = true
                binding.etPassword.isEnabled = true
            }
        }

        loginViewModel.loginResult.observe(viewLifecycleOwner) { success ->
            if (success) {
                guardarUserId(loginViewModel.userId)
                Toast.makeText(requireContext(), "Bienvenido", Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_loginFragment_to_productosFragment)
            }
        }

        loginViewModel.errorMessage.observe(viewLifecycleOwner) { message ->
            if (message.isNotEmpty()) {
                Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun guardarUserId(id: String) {
        val sharedPref = requireActivity().getSharedPreferences(Constantes.PREFS_NAME, Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString(Constantes.USER_ID, id)
            apply()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
