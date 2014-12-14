package controllers

import play.api._
import play.api.mvc._
import java.io.File

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def project = Action {
    Ok(views.html.project("Hello"))
  }

  def getNodes = Action {
    Ok.sendFile(new java.io.File("public/nodes.json"))
  }

  def updateProject = Action(parse.temporaryFile) { request =>
    request.body.moveTo(new File("public/nodes.json"), true)
    Ok("""{"Status":"Success"}""")
  }
}