import { db } from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server';
import { RedirectToSignIn } from '@clerk/nextjs'; // Assurez-vous que ceci est correct

export const initialProfile = async () => {
  // Récupérer l'utilisateur actuel
  const user = await currentUser();
  console.log("User fetched from Clerk:", user);

  // Vérifier si l'utilisateur est null
  if (!user) {
    console.log("No user found, redirecting to sign in.");
    
    // Vérifiez si RedirectToSignIn est une fonction
    if (typeof RedirectToSignIn === 'function') {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      return RedirectToSignIn();
    } else {
      // Alternative avec Next.js
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        }
      };
    }
  }

  // Récupérer le profil de l'utilisateur à partir de la base de données
  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });
  console.log("Profile fetched from database:", profile);

  // Si le profil existe, le retourner
  if (profile) {
    return profile;
  }

  // Si le profil n'existe pas, en créer un nouveau
  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  });
  console.log("New profile created:", newProfile);

  // Retourner le nouveau profil
  return newProfile;
};
