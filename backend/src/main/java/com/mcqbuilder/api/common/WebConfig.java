package com.mcqbuilder.api.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The frontend already runs on :3000 and will call this API in the next
 * milestone, so the allowed origin is configurable (CORS_ALLOWED_ORIGINS)
 * instead of hard-coded.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final String[] allowedOrigins;

	public WebConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
		this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins(allowedOrigins)
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*");
	}
}
