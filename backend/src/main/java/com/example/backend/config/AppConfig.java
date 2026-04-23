package com.example.backend.config;


import com.example.backend.dto.VehicleDTO;
import com.example.backend.entity.Vehicle;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        // Use STRICT strategy to prevent ambiguous property matching
        mapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT);

        // Explicit mapping: Vehicle -> VehicleDTO
        mapper.createTypeMap(Vehicle.class, VehicleDTO.class)
                .addMappings(m -> {
                    // Skip auto-mapping for customerName (we set it manually in service)
                    m.skip(VehicleDTO::setCustomerName);
                    // Explicitly map customerId from nested customer
                    m.map(src -> src.getCustomer().getId(), VehicleDTO::setCustomerId);
                });

        return mapper;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
