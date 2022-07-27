const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getSauces = (req, res, next) => {
  Sauce.find()
  .then((sauces) => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}))
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
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
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => res.status(200).json(sauce))
  .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({
        error: new Error(
            "Vous n'êtes pas le propriétaire de cette sauce."
        ),
        });
      }
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
      res.status(404).json({ error: new Error("Cette sauce n'existe pas") });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(401).json({
      error: new Error(
          "Vous n'êtes pas le propriétaire de cette sauce."
      ),
      });
    }
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
    Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
      .catch((error) => res.status(400).json({ error }));
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
if (req.body.like === -1) {
  if (userDislikeIndex !== -1) {
    return res.status(500).json({
      error: new Error("L'utilisateur a déjà disliké cette sauce"),
    });
  }
  if (userLikeIndex !== -1) {
    sauce.usersLiked.splice(userLikeIndex, 1);
    sauce.likes--;
  }
  sauce.usersDisliked.push(req.body.userId);
  sauce.dislikes++;
}
if (req.body.like === 0) {
  if (userDislikeIndex !== -1) {
    sauce.usersDisliked.splice(userDislikeIndex, 1);
    sauce.dislikes--;
  }
  else if (userLikeIndex !== -1) {
    sauce.usersLiked.splice(userLikeIndex, 1);
    sauce.likes--;
  }
}
Sauce.updateOne({ _id: req.params.id }, sauce).then(() => {
  res.status(200).json({ message: "Avis enregistré !" });
});
});
};