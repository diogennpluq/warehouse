package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/techcontrol/backend/service"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{service: svc}
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req service.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	resp, err := h.service.Login(c.Request().Context(), &req)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid credentials"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req service.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	resp, err := h.service.Register(c.Request().Context(), &req)
	if err != nil {
		if err == service.ErrUsernameExists || err == service.ErrEmailExists {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, resp)
}

func (h *AuthHandler) Refresh(c echo.Context) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" || len(authHeader) <= 7 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing token"})
	}

	tokenString := authHeader[7:]
	token, err := h.service.ValidateToken(tokenString)
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
	}

	claims, _ := token.Claims.(jwt.MapClaims)
	userID := int64(claims["user_id"].(float64))

	user, err := h.service.userRepo.GetByID(c.Request().Context(), userID)
	if err != nil || user == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "user not found"})
	}

	newToken, expiresAt, err := h.service.generateToken(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token": newToken,
		"expires_at": expiresAt,
	})
}
