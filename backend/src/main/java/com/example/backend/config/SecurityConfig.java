package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Public ────────────────────────────────────────────────────
                        .requestMatchers("/api/auth/**").permitAll()

                        // ── Users: /mechanics open to both roles, rest ADMIN only ────
                        // IMPORTANT: specific rule MUST come before the wildcard rule
                        .requestMatchers(HttpMethod.GET, "/api/users/mechanics").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        // ── Vehicles: both roles (ownership enforced in controller) ──
                        .requestMatchers("/api/vehicles/**").hasAnyAuthority("ADMIN", "USER")

                        // ── Bookings: both roles (ownership enforced in controller) ──
                        .requestMatchers("/api/bookings/**").hasAnyAuthority("ADMIN", "USER")

                        // ── Service Orders: GET for both, write for ADMIN only ────────
                        .requestMatchers(HttpMethod.GET, "/api/service-orders/**").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers("/api/service-orders/**").hasAuthority("ADMIN")

                        // ── Invoices: GET for both, write for ADMIN only ──────────────
                        .requestMatchers(HttpMethod.GET, "/api/invoices/**").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers("/api/invoices/**").hasAuthority("ADMIN")

                        // ── Parts / Inventory: GET for both, write for ADMIN only ─────
                        .requestMatchers(HttpMethod.GET, "/api/parts/**").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers("/api/parts/**").hasAuthority("ADMIN")

                        // ── Dashboard: both roles ─────────────────────────────────────
                        .requestMatchers("/api/dashboard/**").hasAnyAuthority("ADMIN", "USER")

                        // ── Everything else: must be authenticated ────────────────────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}