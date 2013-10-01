<?php 
    session_start();
    if(!isset($_SESSION['isLoggedIn']))
    {
        header('HTTP/1.0 401 Unauthorized');
        exit();
    }
?>
<div class="subscribe">
    <div class="form-wrap">
        <div class="form">
            <h1>Rejoignez le label professionnel FIDOLIA</h1>
            <form>
                <div class="input-container">
                    <label>Votre Nom<span class="asterisque">*</span> :</label>
                    <input type="text" value="Léo">
                </div>
                <div class="input-container">
                    <label>Votre email<span class="asterisque">*</span> :</label>
                    <input type="text" value="leo@yummypets.com">
                </div>
                <div class="clear"></div>
                <div class="input-container">
                    <label>Nom de l'établissement<span class="asterisque">*</span> :</label>
                    <input type="text" value="Le bar de Léo">
                </div>
                <div class="input-container">
                    <label>Catégorie<span class="asterisque">*</span> :</label>
                    <input type="text" value="Bar">
                </div>
                <div class="clear"></div>
                <div class="input-container">
                    <label>Adresse<span class="asterisque">*</span> :</label>
                    <input type="text" value="22, rue Vital Carles">
                </div>
                <div class="input-container">
                    <label>Ville<span class="asterisque">*</span> :</label>
                    <input type="text" value="Bordeaux">
                </div>
                <div class="clear"></div>
                <div class="input-container">
                    <label>Code postal<span class="asterisque">*</span> :</label>
                    <input type="text" value="33000">
                </div>
                <div class="input-container">
                    <label>Pays<span class="asterisque">*</span> :</label>
                    <input type="text" value="France">
                </div>
                <div class="clear"></div>
                <div class="input-container">
                    <label>Site web<span class="asterisque">*</span> :</label>
                    <input type="text" value="www.yummypets.com">
                </div>
                <div class="input-container">
                    <label>Possédez/dirigez vous ce lieu ?<span class="asterisque">*</span> :</label>
                    <input type="text" value="OUI/NON">
                </div>
                <div class="clear"></div>
                <div class="textarea-container">
                    <label>Description du lieu<span class="asterisque">*</span> :</label>
                    <textarea>Description du lieu</textarea>
                </div>
                <div class="sendbtn-informationsform">
                    <p>
                        <strong>* Informations obligatoires</strong>
                        Toutes les informations recueillies sont soumise à modération de la part de l’équipe Yummypets lipsum dolorem sit amet ...
                    </p>
                    <input type="button" value="Étape suivante" class="btn-form-subscribe">
                    <div class="clear"></div>
                </div>
            </form>
        </div>
    </div>
    <div class="explanations">
        <div class="labelfidolia-explanations"></div>
        <h2>
            Quels sont <strong>les avantages</strong><br/> de posséder <strong>le label <span class="pink">FIDOLIA</span></strong> ?
        </h2>
        <ul>
            <li>
                <span class="li-number">1</span><span class="li-content">Faites partie du <strong>premier réseau</strong> de lieux publiques/privés <strong>acceptant les animaux de compagnies</strong>.</span>
            </li>
            <li>
                <span class="li-number">2</span><span class="li-content"><strong>Augmentez votre visibilité</strong> sur internet grâce a notre plateforme en ligne.</span>
            </li>
            <li>
                <span class="li-number">3</span><span class="li-content"><strong>Profitez</strong> de la communauté propulsée par <span class="green">Yummypets</span> composée de plus de <strong>150 000 membres</strong> !</span>
            </li>
            <li>
                <span class="li-number">4</span><span class="li-content">Faites partie du <strong>premier réseau</strong> de lieux publiques/privés <strong>acceptant les animaux de compagnies</strong>.</span>

            </li>
        </ul>
    </div>
    <div class="clear"></div>
</div>