/**
 * Authentication Controller
 * Provides enterprise role-based login credentials:
 * - Credit Manager: Safriya
 * - Senior Manager / CFO: Jaris
 */

const USERS = [
  {
    username: 'safriya@kaartech.com',
    aliases: ['credit.manager@kaartech.com', 'safriya'],
    password: 'Credit@123',
    name: 'Safriya',
    role: 'CREDIT_MANAGER',
    roleLabel: 'Credit Operations Manager',
    department: 'Global Credit Operations',
    authorityLimit: '₹10,00,000'
  },
  {
    username: 'jaris.cfo@kaartech.com',
    aliases: ['cfo@kaartech.com', 'jaris', 'senior.manager@kaartech.com'],
    password: 'Executive@123',
    name: 'Jaris',
    role: 'SENIOR_MANAGER',
    roleLabel: 'Senior Finance Manager / CFO',
    department: 'Executive Finance Committee',
    authorityLimit: 'Unlimited (Executive Waiver)'
  }
];

class AuthController {
  login(req, res) {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide both username and password.'
        }
      });
    }

    const cleanUser = username.trim().toLowerCase();
    const user = USERS.find(
      (u) => (u.username.toLowerCase() === cleanUser || u.aliases?.some(a => a.toLowerCase() === cleanUser)) && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password. Please check your credentials.'
        }
      });
    }

    // Return safe user object (omit password)
    const { password: _, aliases: __, ...safeUser } = user;
    res.json({
      success: true,
      data: {
        user: safeUser,
        token: `mock-sap-jwt-${safeUser.role}-${Date.now()}`
      },
      message: `Welcome back, ${safeUser.name} (${safeUser.roleLabel}).`
    });
  }

  getDemoCredentials(req, res) {
    res.json({
      success: true,
      data: USERS.map(({ password, ...u }) => ({
        ...u,
        samplePassword: password
      }))
    });
  }
}

module.exports = new AuthController();
