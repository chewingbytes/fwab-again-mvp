export default async function getUser() {
    try {
      const response = await fetch(
        "http://localhost:5050/api/users/user-auth",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${errorText}`);
      }

      const data = await response.json();
      const userData = data.user
      return userData;
    }
    catch (error) {
        console.error(error);
    }
}