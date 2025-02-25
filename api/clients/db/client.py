import os
from typing import Optional, Dict, List, Any, Union
from datetime import datetime, timezone

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project-ref.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-or-service-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



class DBClient:
    """
    Class to handle CRUD operations for the users and oauth_credentials tables
    using the Supabase client.
    """

    # =================== User Operations ===================
    @staticmethod
    def create_user(email: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new user in the database.

        Args:
            email: User's email address (required)
            first_name: User's first name (optional)
            last_name: User's last name (optional)

        Returns:
            Dictionary containing the created user data
        """
        user_data = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name
        }

        result = supabase.table("users").insert(user_data).execute()

        if len(result.data) > 0:
            return result.data[0]

        raise Exception("Failed to create user")

    @staticmethod
    def get_user_by_id(user_id: int) -> Dict[str, Any]:
        """
        Retrieve a user by their ID.

        Args:
            user_id: The ID of the user to retrieve

        Returns:
            Dictionary containing the user data
        """
        result = supabase.table("users").select("*").eq("id", user_id).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"User with ID {user_id} not found")

    @staticmethod
    def get_user_by_email(email: str) -> Dict[str, Any]:
        """
        Retrieve a user by their email address.

        Args:
            email: The email address of the user to retrieve

        Returns:
            Dictionary containing the user data
        """
        result = supabase.table("users").select("*").eq("email", email).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"User with email {email} not found")

    @staticmethod
    def list_users(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List users with pagination.

        Args:
            limit: Maximum number of users to return
            offset: Offset for pagination

        Returns:
            List of user dictionaries
        """
        result = supabase.table("users").select("*").range(offset, offset + limit - 1).execute()

        return result.data

    @staticmethod
    def update_user(
            user_id: int,
            email: Optional[str] = None,
            first_name: Optional[str] = None,
            last_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update a user's information.

        Args:
            user_id: The ID of the user to update
            email: New email address (optional)
            first_name: New first name (optional)
            last_name: New last name (optional)

        Returns:
            Dictionary containing the updated user data
        """
        update_data = {}
        if email is not None:
            update_data["email"] = email
        if first_name is not None:
            update_data["first_name"] = first_name
        if last_name is not None:
            update_data["last_name"] = last_name

        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            result = supabase.table("users").update(update_data).eq("id", user_id).execute()

            if result.data and len(result.data) > 0:
                return result.data[0]

            raise Exception(f"Failed to update user with ID {user_id}")

        return SupabaseCRUD.get_user_by_id(user_id)

    @staticmethod
    def delete_user(user_id: int) -> Dict[str, Any]:
        """
        Delete a user by their ID. This will also delete all related OAuth credentials
        due to the CASCADE constraint.

        Args:
            user_id: The ID of the user to delete

        Returns:
            Dictionary containing the deleted user data
        """
        result = supabase.table("users").delete().eq("id", user_id).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"Failed to delete user with ID {user_id}")

    # =================== OAuth Credential Operations ===================
    @staticmethod
    def create_oauth_credential(
            user_id: int,
            provider: str,
            access_token: str,
            refresh_token: Optional[str] = None,
            expires_at: Optional[Union[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Create a new OAuth credential for a user.

        Args:
            user_id: The ID of the user
            provider: OAuth provider ('gcal' or 'notion')
            access_token: OAuth access token
            refresh_token: OAuth refresh token (optional)
            expires_at: Token expiration datetime (optional)

        Returns:
            Dictionary containing the created OAuth credential data
        """
        if isinstance(expires_at, datetime):
            expires_at = expires_at.isoformat()

        credential_data = {
            "user_id": user_id,
            "provider": provider,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at
        }

        result = supabase.table("oauth_credentials").insert(credential_data).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"Failed to create OAuth credential for user {user_id}")

    @staticmethod
    def get_oauth_credential(user_id: int, provider: str) -> Dict[str, Any]:
        """
        Retrieve an OAuth credential for a specific user and provider.

        Args:
            user_id: The ID of the user
            provider: OAuth provider ('gcal' or 'notion')

        Returns:
            Dictionary containing the OAuth credential data
        """
        result = (
            supabase.table("oauth_credentials")
            .select("*")
            .eq("user_id", user_id)
            .eq("provider", provider)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"OAuth credential not found for user {user_id} and provider {provider}")

    @staticmethod
    def list_user_oauth_credentials(user_id: int) -> List[Dict[str, Any]]:
        """
        List all OAuth credentials for a specific user.

        Args:
            user_id: The ID of the user

        Returns:
            List of OAuth credential dictionaries
        """
        result = (
            supabase.table("oauth_credentials")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return result.data

    @staticmethod
    def update_oauth_credential(
            user_id: int,
            provider: str,
            access_token: Optional[str] = None,
            refresh_token: Optional[str] = None,
            expires_at: Optional[Union[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Update an OAuth credential for a specific user and provider.

        Args:
            user_id: The ID of the user
            provider: OAuth provider ('gcal' or 'notion')
            access_token: New OAuth access token (optional)
            refresh_token: New OAuth refresh token (optional)
            expires_at: New token expiration datetime (optional)

        Returns:
            Dictionary containing the updated OAuth credential data
        """
        update_data = {}
        if access_token is not None:
            update_data["access_token"] = access_token
        if refresh_token is not None:
            update_data["refresh_token"] = refresh_token
        if expires_at is not None:
            if isinstance(expires_at, datetime):
                expires_at = expires_at.isoformat()
            update_data["expires_at"] = expires_at

        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            result = (
                supabase.table("oauth_credentials")
                .update(update_data)
                .eq("user_id", user_id)
                .eq("provider", provider)
                .execute()
            )

            if result.data and len(result.data) > 0:
                return result.data[0]

            raise Exception(f"Failed to update OAuth credential for user {user_id} and provider {provider}")

        return SupabaseCRUD.get_oauth_credential(user_id, provider)

    @staticmethod
    def delete_oauth_credential(user_id: int, provider: str) -> Dict[str, Any]:
        """
        Delete an OAuth credential for a specific user and provider.

        Args:
            user_id: The ID of the user
            provider: OAuth provider ('gcal' or 'notion')

        Returns:
            Dictionary containing the deleted OAuth credential data
        """
        result = (
            supabase.table("oauth_credentials")
            .delete()
            .eq("user_id", user_id)
            .eq("provider", provider)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return result.data[0]

        raise Exception(f"Failed to delete OAuth credential for user {user_id} and provider {provider}")
