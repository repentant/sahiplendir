
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var Image = require('parse-image');
var Mandrill = require('mandrill');
Mandrill.initialize('BiJvzz48NHUb6-vSGCkRbA');

Parse.Cloud.define("savePostImage", function(request, response) {
	
		var RATIO = 9/16;
		var buffer_obj;
		var img_large_url;
	
		console.log(request.params.url);
		
		Parse.Cloud.httpRequest({
			
			url: request.params.url
		})	
			
		// crop large picture if necessary
		
		
		.then(function(response) {	
			var image_large = new Image();
			buffer_obj = response.buffer;
			return image_large.setData(buffer_obj);
		}).then(function(image_large) {
				
				return image_large.crop({
				  width: image_large.width(),
				  height: image_large.width() * RATIO
				});
		
		}).then(function(image_large) {
			// Make sure it's a JPEG to save disk space and bandwidth.
			return image_large.setFormat("JPEG");
		 
		}).then(function(image_large) {
			// Get the image data in a Buffer.
			return image_large.data();
		 
		}).then(function(buffer) {
			// Save the image into a new file.
			var base64 = buffer.toString("base64");
			console.log(base64);
			var cropped_large = new Parse.File("large.jpg", { base64: base64 });
			return cropped_large.save();
			
		})
					
		// then let's make thumbnail
		
		.then(function(cropped_large) {	
			img_large_url = cropped_large.url();
			var image = new Image();
			return image.setData(buffer_obj);
		}).then(function(image) {
				var size = Math.min(image.width(), image.height());
				return image.crop({
				  left: (image.width() - size) / 2,
				  top: (image.height() - size) / 2,
				  width: size,
				  height: size
				});
		
		}).then(function(image) {
		 // Resize the image to 64x64.
			return image.scale({
			  width: 64,
			  height: 64
			});
		 
		}).then(function(image) {
			// Make sure it's a JPEG to save disk space and bandwidth.
			return image.setFormat("JPEG");
		 
		}).then(function(image) {
			// Get the image data in a Buffer.
			return image.data();
		 
		}).then(function(buffer) {
			// Save the image into a new file.
			var base64 = buffer.toString("base64");
			var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
			return cropped.save();
		}).then(function(cropped) {
			response.success({large: img_large_url, small: cropped.url()});
						
		}, function(error) {
			response.error(error);
		
		})
	
});


Parse.Cloud.define("sendPasswordMail", function(request, response) {
	
	console.log(request.params);
	
	Mandrill.sendEmail({
	  message: {
		html: "<h2>Merhaba <b>"+request.params.name+"</b>,</h2>Bu mail şifrenizi unuttuğunuz için yollanmıştır. Kayıp şifreniz aşağıdaki gibidir; <br><br><h2><b>"+request.params.pwd+"</b></h2>",
		subject: "Sahiplendir - Kayıp Şifreniz",
		from_email: "info@sahiplendir.com",
		from_name: "Sahiplendir",
		to: [
		  {
			email: request.params.mailToSend,
			name: request.params.name
		  }
		]
	  },
	  async: true
	},{
	  success: function(httpResponse) {
		console.log(httpResponse);
		response.success("Email sent!");
	  },
	  error: function(httpResponse) {
		console.error(httpResponse);
		response.error("Uh oh, something went wrong");
	  }
});	
	
})


