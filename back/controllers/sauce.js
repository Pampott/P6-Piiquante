const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getSauces = (req, res, next) => {
   Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}))
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject);
    delete sauceObject._id;
    const sauce = new Sauce({
        userId : sauceObject.userId,
        name : sauceObject.name,
        manufacturer : sauceObject.manufacturer,   
        description : sauceObject.description,
        mainPepper : sauceObject.mainPepper,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        heat : sauceObject.heat,
        likes : 0,           
        dislikes : 0,        
        usersLiked : [],     
        usersDisliked : [], 
    });
    sauce.save()
    .then(() => res.status(201).json({message: "Nouvelle sauce ajoutée avec succès !"}))
    .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id,
    })
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {

        const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {

        const sauceObject = req.file
          ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            }
          :
            { ...req.body };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce mise à jour !" }))
          .catch((error) => res.status(400).json({ error }));
        });
    });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        if (!sauce) {
            res.status(404).json({
            error: new Error("Cette sauce n'existe pas"),
            });
        }
        if (sauce.userId !== req.auth.userId) {
            res.status(401).json({
            error: new Error(
                "Vous ne pouvez pas supprimer une sauce dont vous n'êtres pas le propriétaire"
            ),
            });
        }
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) =>res.status(400).json({ error }));
        });
    });
};

exports.likeSauce = (req, res, next) => {
Sauce.findOne({ _id: req.params.id })
.then((sauce) => {
    if (!sauce) {
    return res.status(404).json({
        error: new Error("Cette sauce n'existe pas"),
    });
    };
    const userLikeIndex = sauce.usersLiked.findIndex(
    (userId) => userId == req.body.userId
    );
    const userDislikeIndex = sauce.usersDisliked.findIndex(
    (userId) => userId == req.body.userId
    );
    if (req.body.like === 1) {
        if (userLikeIndex !== -1) {
            return res.status(500).json({
            error: new Error("L'utilisateur a déjà liké cette sauce"),
            });
    }
        if (userDislikeIndex !== -1) {
            sauce.usersDisliked.splice(userDislikeIndex, 1);
            sauce.dislikes--;
        }
  sauce.usersLiked.push(req.body.userId);
  sauce.likes++;
}
// Si l'utilisateur a cliqué sur le bouton de dislike
if (req.body.like === -1) {
  // Si l'user ID est déjà dans le tableau des dislikes
  if (userDislikeIndex !== -1) {
    // On renvoie le code 500 (Internal Server Error) ainsi qu'une nouvelle erreur
    return res.status(500).json({
      error: new Error("L'utilisateur a déjà disliké cette sauce"),
    });
  }
  // Si l'user ID est déjà dans le tableau des likes
  if (userLikeIndex !== -1) {
    // On supprime l'user ID du tableau des likes et on soustrait 1 au nombre de likes
    sauce.usersLiked.splice(userLikeIndex, 1);
    sauce.likes--;
  }
  // On ajoute l'user ID dans le tableau des dislikes et on ajoute 1 au nombre de dislikes
  sauce.usersDisliked.push(req.body.userId);
  sauce.dislikes++;
}
// Si l'utilisateur a annulé son like/dislike
if (req.body.like === 0) {
  // Si l'user ID est déjà dans le tableau des dislikes
  if (userDislikeIndex !== -1) {
    // On supprime l'user ID du tableau des dislikes et on soustrait 1 au nombre de dislikes
    sauce.usersDisliked.splice(userDislikeIndex, 1);
    sauce.dislikes--;
  }
  // Si l'user ID est déjà dans le tableau des likes
  else if (userLikeIndex !== -1) {
    // On supprime l'user ID du tableau des likes et on soustrait 1 au nombre de likes
    sauce.usersLiked.splice(userLikeIndex, 1);
    sauce.likes--;
  }
}
// On met à jour la sauce dont l'id correspond à celui contenu dans les paramètres de la requête
Sauce.updateOne({ _id: req.params.id }, sauce).then(() => {
  // On renvoie le code 200 (OK) ainsi qu'un message de confirmation
  res.status(200).json({ message: "Avis pris en compte" });
});
});
};